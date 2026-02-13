// n8n Webhook integration helper
// Configure your n8n webhook URLs in .env.local

const N8N_BASE_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;

/**
 * Call an n8n webhook
 */
async function callN8nWebhook(path, data = {}, method = 'POST') {
  const url = `${N8N_BASE_URL}${path}`;

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: method !== 'GET' ? JSON.stringify(data) : undefined,
  });

  if (!res.ok) {
    throw new Error(`n8n webhook error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

// --- Dashboard Data (fetched via n8n from your data sources) ---

export async function fetchDashboardSummary(userId) {
  return callN8nWebhook('/dashboard/summary', { userId });
}

export async function fetchTrends(userId, days = 30) {
  return callN8nWebhook('/dashboard/trends', { userId, days });
}

export async function fetchAlerts(userId) {
  return callN8nWebhook('/dashboard/alerts', { userId });
}

// --- AI Chat (n8n processes AI requests) ---

export async function sendChatMessage(userId, message, chatHistory = []) {
  return callN8nWebhook('/chat', { userId, message, chatHistory });
}

// --- Reports (n8n generates reports) ---

export async function generateReport(userId, type, dateRange) {
  return callN8nWebhook('/reports/generate', { userId, type, dateRange });
}

// --- Notifications (n8n sends notifications) ---

export async function notifyPaymentSuccess(userId, orderId, planId) {
  return callN8nWebhook('/notifications/payment', {
    userId,
    orderId,
    planId,
    event: 'payment_success',
  });
}

export async function notifyNewUser(userId, email) {
  return callN8nWebhook('/notifications/new-user', {
    userId,
    email,
    event: 'new_user',
  });
}
