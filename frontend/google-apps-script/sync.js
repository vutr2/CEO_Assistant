// =============================================
// CEO Dashboard - Google Sheets Auto Sync
// =============================================
// HƯỚNG DẪN CÀI ĐẶT:
// 1. Mở Google Sheets của bạn
// 2. Vào menu: Extensions → Apps Script
// 3. Xóa code mặc định, paste toàn bộ code này vào
// 4. Thay YOUR_SYNC_TOKEN bằng token từ Dashboard
// 5. Thay YOUR_APP_URL bằng URL ứng dụng
// 6. Nhấn nút Save (Ctrl+S)
// 7. Chạy hàm setupTrigger() một lần để bật auto-sync
//
// CẤU TRÚC GOOGLE SHEETS:
// Tạo 4 tab (sheet) với tên CHÍNH XÁC như sau:
//
// Tab "DonHang" (Đơn hàng):
//   Cột A: Ngày (dd/mm/yyyy)
//   Cột B: Tên khách hàng
//   Cột C: Sản phẩm
//   Cột D: Số lượng
//   Cột E: Đơn giá
//   Cột F: Thành tiền
//   Cột G: Trạng thái
//   Cột H: Ghi chú
//
// Tab "ChiPhi" (Chi phí):
//   Cột A: Ngày (dd/mm/yyyy)
//   Cột B: Danh mục
//   Cột C: Mô tả
//   Cột D: Số tiền
//   Cột E: Người chi
//   Cột F: Ghi chú
//
// Tab "KhoHang" (Kho hàng):
//   Cột A: Ngày (dd/mm/yyyy)
//   Cột B: Tên sản phẩm
//   Cột C: Nhập kho
//   Cột D: Xuất kho
//   Cột E: Tồn kho
//   Cột F: Ghi chú
//
// Tab "NhanSu" (Nhân sự):
//   Cột A: Tên nhân viên
//   Cột B: Chức vụ
//   Cột C: Phòng ban
//   Cột D: Lương
//   Cột E: Ngày bắt đầu (dd/mm/yyyy)
//   Cột F: Trạng thái
//   Cột G: Ghi chú
// =============================================

// === CẤU HÌNH - THAY ĐỔI THEO TÀI KHOẢN CỦA BẠN ===
var CONFIG = {
  SYNC_TOKEN: 'YOUR_SYNC_TOKEN',        // Lấy từ Dashboard → Kết nối Sheets
  APP_URL: 'YOUR_APP_URL',              // VD: https://your-app.vercel.app hoặc http://localhost:3000
};

// === SHEET TYPE MAPPING ===
var SHEET_MAP = {
  'DonHang': 'orders',
  'ChiPhi': 'expenses',
  'KhoHang': 'inventory',
  'NhanSu': 'employees',
};

// === AUTO SYNC KHI CHỈNH SỬA ===
function onEdit(e) {
  var sheet = e.source.getActiveSheet();
  var sheetName = sheet.getName();

  if (!SHEET_MAP[sheetName]) return; // Bỏ qua tab không liên quan

  // Đợi 2 giây để người dùng nhập xong
  Utilities.sleep(2000);

  // Sync toàn bộ dữ liệu của tab này
  syncSheet(sheetName);
}

// === SYNC MỘT TAB CỤ THỂ ===
function syncSheet(sheetName) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) return;

  var sheetType = SHEET_MAP[sheetName];
  if (!sheetType) return;

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return; // Chỉ có header

  var headers = data[0];
  var rows = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    // Bỏ qua dòng trống
    if (!row[0] && !row[1]) continue;

    var rowData = parseRow(sheetType, row, sheetName + '_' + (i + 1));
    if (rowData) rows.push(rowData);
  }

  if (rows.length === 0) return;

  // Gửi lên server
  var url = CONFIG.APP_URL + '/api/sheets/sync';
  var payload = {
    sheetType: sheetType,
    rows: rows,
  };

  try {
    var response = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'x-sync-token': CONFIG.SYNC_TOKEN,
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    });

    var code = response.getResponseCode();
    var body = response.getContentText();

    if (code === 200) {
      SpreadsheetApp.getActiveSpreadsheet().toast(
        'Đã đồng bộ ' + rows.length + ' dòng từ ' + sheetName,
        'Sync thành công ✓',
        3
      );
    } else {
      SpreadsheetApp.getActiveSpreadsheet().toast(
        'Lỗi: ' + body,
        'Sync thất bại ✗',
        5
      );
      Logger.log('Sync error: ' + code + ' - ' + body);
    }
  } catch (err) {
    SpreadsheetApp.getActiveSpreadsheet().toast(
      'Lỗi kết nối: ' + err.message,
      'Sync thất bại ✗',
      5
    );
    Logger.log('Sync exception: ' + err.message);
  }
}

// === PARSE ROW THEO LOẠI SHEET ===
function parseRow(sheetType, row, sheetRowId) {
  switch (sheetType) {
    case 'orders':
      return {
        date: formatDate(row[0]),
        customerName: String(row[1] || ''),
        product: String(row[2] || ''),
        quantity: Number(row[3]) || 0,
        unitPrice: Number(row[4]) || 0,
        total: Number(row[5]) || (Number(row[3]) || 0) * (Number(row[4]) || 0),
        status: String(row[6] || 'completed'),
        notes: String(row[7] || ''),
        sheetRowId: sheetRowId,
      };

    case 'expenses':
      return {
        date: formatDate(row[0]),
        category: String(row[1] || ''),
        description: String(row[2] || ''),
        amount: Number(row[3]) || 0,
        paidBy: String(row[4] || ''),
        notes: String(row[5] || ''),
        sheetRowId: sheetRowId,
      };

    case 'inventory':
      return {
        date: formatDate(row[0]),
        productName: String(row[1] || ''),
        quantityIn: Number(row[2]) || 0,
        quantityOut: Number(row[3]) || 0,
        stockRemaining: Number(row[4]) || 0,
        notes: String(row[5] || ''),
        sheetRowId: sheetRowId,
      };

    case 'employees':
      return {
        employeeName: String(row[0] || ''),
        role: String(row[1] || ''),
        department: String(row[2] || ''),
        salary: Number(row[3]) || 0,
        startDate: formatDate(row[4]),
        status: String(row[5] || 'active'),
        notes: String(row[6] || ''),
        sheetRowId: sheetRowId,
      };

    default:
      return null;
  }
}

// === FORMAT DATE ===
function formatDate(value) {
  if (!value) return null;
  if (value instanceof Date) {
    var y = value.getFullYear();
    var m = ('0' + (value.getMonth() + 1)).slice(-2);
    var d = ('0' + value.getDate()).slice(-2);
    return y + '-' + m + '-' + d;
  }
  // Nếu là string dd/mm/yyyy
  var str = String(value);
  var parts = str.split('/');
  if (parts.length === 3) {
    return parts[2] + '-' + parts[1] + '-' + parts[0];
  }
  return str;
}

// === CÀI ĐẶT TRIGGER TỰ ĐỘNG ===
// Chạy hàm này MỘT LẦN để bật auto-sync
function setupTrigger() {
  // Xóa trigger cũ nếu có
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }

  // Tạo trigger onEdit
  ScriptApp.newTrigger('onEdit')
    .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
    .onEdit()
    .create();

  SpreadsheetApp.getActiveSpreadsheet().toast(
    'Auto-sync đã được bật. Mỗi khi bạn chỉnh sửa dữ liệu, nó sẽ tự động đồng bộ lên Dashboard.',
    'Cài đặt thành công ✓',
    5
  );
}

// === SYNC TOÀN BỘ (Thủ công) ===
// Chạy hàm này nếu muốn sync tất cả tab cùng lúc
function syncAll() {
  var sheetNames = Object.keys(SHEET_MAP);
  for (var i = 0; i < sheetNames.length; i++) {
    syncSheet(sheetNames[i]);
  }
}

// === MENU TÙY CHỈNH ===
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('CEO Dashboard')
    .addItem('Sync tất cả', 'syncAll')
    .addItem('Cài đặt Auto-Sync', 'setupTrigger')
    .addToUi();
}
