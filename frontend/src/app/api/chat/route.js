import { NextResponse } from 'next/server';
import { getOrCreateUser, saveChatMessage, getDailyMetrics } from '../../../lib/supabase';

export async function POST(request) {
  try {
    const { userId, message } = await request.json();

    if (!userId || !message) {
      return NextResponse.json(
        { error: 'Missing userId or message' },
        { status: 400 }
      );
    }

    const dbUser = await getOrCreateUser(userId, '', '');

    // Save user message
    await saveChatMessage(dbUser.id, 'user', message);

    // Get recent metrics for context
    const metrics = await getDailyMetrics(dbUser.id, 7);
    const today = metrics.length > 0 ? metrics[metrics.length - 1] : null;

    // Generate a simple response based on available data
    let reply;
    if (!today) {
      reply = 'Hiện tại chưa có dữ liệu kinh doanh. Hãy nhập dữ liệu vào Google Sheets hoặc Supabase để tôi có thể phân tích cho bạn.';
    } else {
      const totalRevenue7d = metrics.reduce((s, m) => s + (m.revenue || 0), 0);
      const totalProfit7d = metrics.reduce((s, m) => s + (m.profit || 0), 0);
      const avgMargin = metrics.length > 0
        ? (metrics.reduce((s, m) => s + (m.profit_margin || 0), 0) / metrics.length).toFixed(1)
        : 0;

      reply = `Dựa trên dữ liệu 7 ngày gần nhất:\n` +
        `- Doanh thu hôm nay: ${(today.revenue || 0).toLocaleString('vi-VN')} VNĐ\n` +
        `- Lợi nhuận hôm nay: ${(today.profit || 0).toLocaleString('vi-VN')} VNĐ\n` +
        `- Tổng doanh thu 7 ngày: ${totalRevenue7d.toLocaleString('vi-VN')} VNĐ\n` +
        `- Tổng lợi nhuận 7 ngày: ${totalProfit7d.toLocaleString('vi-VN')} VNĐ\n` +
        `- Biên lợi nhuận trung bình: ${avgMargin}%\n\n` +
        `Bạn muốn tôi phân tích thêm về mặt nào?`;
    }

    // Save AI response
    await saveChatMessage(dbUser.id, 'assistant', reply);

    return NextResponse.json({ message: reply });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
