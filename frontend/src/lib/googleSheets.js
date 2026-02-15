import { google } from 'googleapis';

// Initialize Google Sheets client with service account
function getGoogleSheetsClient() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}');
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  return google.sheets({ version: 'v4', auth });
}

// Get service account email for sharing instructions
export function getServiceAccountEmail() {
  try {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}');
    return credentials.client_email || '';
  } catch {
    return '';
  }
}

// Extract sheet ID from Google Sheets URL
export function extractSheetId(url) {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

// Validate that the service account can access the sheet
export async function validateSheetAccess(sheetId) {
  try {
    const sheets = getGoogleSheetsClient();
    const response = await sheets.spreadsheets.get({
      spreadsheetId: sheetId,
      fields: 'properties.title,sheets.properties.title',
    });
    return {
      valid: true,
      title: response.data.properties.title,
      tabs: response.data.sheets.map((s) => s.properties.title),
    };
  } catch (error) {
    if (error.code === 403 || error.code === 404) {
      return { valid: false, error: 'Không thể truy cập sheet. Hãy share sheet với service account email.' };
    }
    throw error;
  }
}

// Known tab name aliases → maps to typed Supabase table
// Supports Vietnamese (có dấu / không dấu), English, different casing & spacing
const TAB_ALIASES = {
  orders: [
    'donhang', 'don hang', 'đơn hàng', 'đơnhàng',
    'orders', 'order', 'sales', 'banhang', 'ban hang', 'bán hàng',
    'doanhthu', 'doanh thu',
  ],
  expenses: [
    'chiphi', 'chi phi', 'chi phí', 'chiphí',
    'expenses', 'expense', 'costs', 'cost',
    'chitiêu', 'chi tiêu',
  ],
  inventory: [
    'khohang', 'kho hang', 'kho hàng', 'khohàng',
    'inventory', 'stock', 'warehouse',
    'tonkho', 'tồn kho', 'tồnkho', 'ton kho',
  ],
  employees: [
    'nhansu', 'nhan su', 'nhân sự', 'nhânsự',
    'employees', 'employee', 'staff', 'personnel',
    'nhanvien', 'nhân viên', 'nhânviên', 'nhan vien',
  ],
};

// Normalize a tab name: lowercase, remove extra spaces, trim
function normalizeTabName(name) {
  return String(name).toLowerCase().trim().replace(/\s+/g, ' ');
}

// Match a tab name to a known sheet type using aliases
function matchTabType(tabName) {
  const normalized = normalizeTabName(tabName);
  for (const [sheetType, aliases] of Object.entries(TAB_ALIASES)) {
    // Check exact alias match (normalized)
    if (aliases.includes(normalized)) return sheetType;
    // Check without spaces
    const noSpace = normalized.replace(/\s/g, '');
    if (aliases.some((a) => a.replace(/\s/g, '') === noSpace)) return sheetType;
  }
  return null;
}

// Legacy export for compatibility
const KNOWN_TABS = {
  DonHang: 'orders',
  ChiPhi: 'expenses',
  KhoHang: 'inventory',
  NhanSu: 'employees',
};

// Number of "known" columns per tab type (extra columns beyond this go to extra_data)
const KNOWN_COLUMNS = {
  orders: 8,     // Ngày, Khách hàng, Sản phẩm, Số lượng, Đơn giá, Thành tiền, Trạng thái, Ghi chú
  expenses: 6,   // Ngày, Danh mục, Mô tả, Số tiền, Người chi, Ghi chú
  inventory: 6,  // Ngày, Sản phẩm, Nhập kho, Xuất kho, Tồn kho, Ghi chú
  employees: 7,  // Tên NV, Chức vụ, Phòng ban, Lương, Ngày BĐ, Trạng thái, Ghi chú
};

// Read ALL tabs from a Google Sheet (not just known ones)
export async function readAllTabs(sheetId) {
  const sheets = getGoogleSheetsClient();

  // First get list of all tabs
  const meta = await sheets.spreadsheets.get({
    spreadsheetId: sheetId,
    fields: 'sheets.properties.title',
  });

  const allTabNames = meta.data.sheets.map((s) => s.properties.title);
  const result = {};

  // Read all tabs in parallel
  const promises = allTabNames.map(async (tabName) => {
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `'${tabName}'!A:ZZ`,
      });
      return { tabName, data: response.data.values || [] };
    } catch {
      return { tabName, data: [] };
    }
  });

  const results = await Promise.all(promises);
  for (const { tabName, data } of results) {
    result[tabName] = data;
  }

  return result;
}

// Format date value from sheet
function formatDate(value) {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return String(value);
  const parts = String(value).split('/');
  if (parts.length === 3) {
    return parts[2] + '-' + parts[1].padStart(2, '0') + '-' + parts[0].padStart(2, '0');
  }
  const d = new Date(value);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split('T')[0];
  }
  return String(value);
}

// Build extra_data object from extra columns beyond known ones
function buildExtraData(headers, row, startIndex) {
  const extra = {};
  for (let i = startIndex; i < headers.length; i++) {
    const key = headers[i];
    if (key && row[i] !== undefined && row[i] !== '') {
      extra[key] = row[i];
    }
  }
  return Object.keys(extra).length > 0 ? extra : {};
}

// Parse rows dynamically based on tab name
// Returns { type: 'known'|'custom', sheetType, rows }
export function parseDynamicRows(tabName, rawRows) {
  if (!rawRows || rawRows.length <= 1) return { type: 'empty', sheetType: null, rows: [] };

  const headers = rawRows[0].map((h) => String(h || '').trim());
  const dataRows = rawRows.slice(1);
  const sheetType = matchTabType(tabName);

  if (sheetType) {
    // Known tab → parse typed data + extra_data for extra columns
    return {
      type: 'known',
      sheetType,
      rows: parseKnownTab(sheetType, headers, dataRows),
    };
  } else {
    // Custom tab → parse as generic key-value data
    return {
      type: 'custom',
      sheetType: null,
      tabName,
      rows: parseCustomTab(tabName, headers, dataRows),
    };
  }
}

// Parse known tab (DonHang, ChiPhi, KhoHang, NhanSu) with extra column support
function parseKnownTab(sheetType, headers, dataRows) {
  const knownColCount = KNOWN_COLUMNS[sheetType] || 0;
  const parsed = [];

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    if (!row || (!row[0] && !row[1])) continue;

    const sheetRowId = sheetType + '_' + (i + 2);
    const extraData = buildExtraData(headers, row, knownColCount);
    let item = null;

    switch (sheetType) {
      case 'orders':
        item = {
          date: formatDate(row[0]),
          customerName: String(row[1] || ''),
          product: String(row[2] || ''),
          quantity: Number(row[3]) || 0,
          unitPrice: Number(row[4]) || 0,
          total: Number(row[5]) || (Number(row[3]) || 0) * (Number(row[4]) || 0),
          status: String(row[6] || 'completed'),
          notes: String(row[7] || ''),
          sheetRowId,
          extraData,
        };
        break;

      case 'expenses':
        item = {
          date: formatDate(row[0]),
          category: String(row[1] || ''),
          description: String(row[2] || ''),
          amount: Number(row[3]) || 0,
          paidBy: String(row[4] || ''),
          notes: String(row[5] || ''),
          sheetRowId,
          extraData,
        };
        break;

      case 'inventory':
        item = {
          date: formatDate(row[0]),
          productName: String(row[1] || ''),
          quantityIn: Number(row[2]) || 0,
          quantityOut: Number(row[3]) || 0,
          stockRemaining: Number(row[4]) || 0,
          notes: String(row[5] || ''),
          sheetRowId,
          extraData,
        };
        break;

      case 'employees':
        item = {
          employeeName: String(row[0] || ''),
          role: String(row[1] || ''),
          department: String(row[2] || ''),
          salary: Number(row[3]) || 0,
          startDate: formatDate(row[4]),
          status: String(row[5] || 'active'),
          notes: String(row[6] || ''),
          sheetRowId,
          extraData,
        };
        break;
    }

    if (item) parsed.push(item);
  }

  return parsed;
}

// Parse custom tab as generic key-value objects
function parseCustomTab(tabName, headers, dataRows) {
  const parsed = [];

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    if (!row || row.every((cell) => !cell && cell !== 0)) continue;

    const data = {};
    for (let j = 0; j < headers.length; j++) {
      const key = headers[j];
      if (key) {
        data[key] = row[j] !== undefined ? row[j] : '';
      }
    }

    parsed.push({
      rowIndex: i + 2, // 1-indexed + header
      sheetRowId: tabName + '_' + (i + 2),
      data,
    });
  }

  return parsed;
}

export { KNOWN_TABS };
