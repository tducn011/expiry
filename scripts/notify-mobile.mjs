#!/usr/bin/env node
/**
 * Mobile Alert Dispatcher for Expiry CI/CD & DevOps Automation.
 * Dispatches instant notifications to smartphone via:
 *   1. ntfy.sh (No config needed, instant push notification via ntfy app)
 *   2. Telegram Bot (if TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID exist)
 *
 * Usage:
 *   node scripts/notify-mobile.mjs "Tiêu đề" "Nội dung chi tiết" [URL]
 */

const title = process.argv[2] || '⚡ [Expiry DevOps Alert]';
const message = process.argv[3] || 'Thông báo từ hệ thống Expiry Control Center.';
const url = process.argv[4] || 'https://github.com/tducn110/expiry';

const NTFY_TOPIC = process.env.NTFY_TOPIC || 'expiry-alerts-tducn';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function sendNtfy() {
  try {
    const res = await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
      method: 'POST',
      headers: {
        'Title': title,
        'Click': url,
        'Tags': 'rocket,bell',
        'Content-Type': 'text/plain; charset=utf-8'
      },
      body: message,
      signal: AbortSignal.timeout(5000)
    });
    if (res.ok) {
      console.log(`📱 [NTFY PUSH] Đã gửi thông báo thành công tới topic: https://ntfy.sh/${NTFY_TOPIC}`);
      return true;
    }
    console.warn(`⚠️ [NTFY ERROR] HTTP ${res.status}`);
    return false;
  } catch (err) {
    console.warn(`⚠️ [NTFY ERROR] Không thể gửi ntfy: ${err.message}`);
    return false;
  }
}

async function sendTelegram() {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return false;
  try {
    const text = `🔔 *${title}*\n\n${message}\n\n👉 [Mở liên kết](${url})`;
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: 'Markdown'
      }),
      signal: AbortSignal.timeout(5000)
    });
    if (res.ok) {
      console.log('📱 [TELEGRAM] Đã gửi tin nhắn qua Telegram Bot thành công!');
      return true;
    }
    console.warn(`⚠️ [TELEGRAM ERROR] HTTP ${res.status}`);
    return false;
  } catch (err) {
    console.warn(`⚠️ [TELEGRAM ERROR] ${err.message}`);
    return false;
  }
}

async function main() {
  console.log(`📣 Đang phát thông báo tới điện thoại: "${title}"...`);
  await Promise.all([sendNtfy(), sendTelegram()]);
}

main();
