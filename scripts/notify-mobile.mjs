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

import { execSync } from 'node:child_process';

const title = process.argv[2] || '⚡ [Expiry DevOps Alert]';
const message = process.argv[3] || 'Thông báo từ hệ thống Expiry Control Center.';
const url = process.argv[4] || 'https://github.com/tducn110/expiry';

const NTFY_TOPIC = process.env.NTFY_TOPIC || 'expiry-alerts-tducn';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

function sendNtfy() {
  try {
    const cmd = `curl -s -H "Title: ${title}" -H "Click: ${url}" -H "Tags: rocket,bell" -d "${message}" https://ntfy.sh/${NTFY_TOPIC}`;
    execSync(cmd, { stdio: 'pipe', timeout: 5000 });
    console.log(`📱 [NTFY PUSH] Đã gửi thông báo thành công tới topic: https://ntfy.sh/${NTFY_TOPIC}`);
    return true;
  } catch (err) {
    console.warn(`⚠️ [NTFY ERROR] Không thể gửi ntfy: ${err.message}`);
    return false;
  }
}

function sendTelegram() {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return false;
  try {
    const text = `🔔 *${title}*\n\n${message}\n\n👉 [Mở liên kết](${url})`;
    const payload = JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text,
      parse_mode: 'Markdown',
    });
    execSync(`curl -s -X POST -H "Content-Type: application/json" -d '${payload}' https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, { stdio: 'pipe', timeout: 5000 });
    console.log('📱 [TELEGRAM] Đã gửi tin nhắn qua Telegram Bot thành công!');
    return true;
  } catch (err) {
    console.warn(`⚠️ [TELEGRAM ERROR] ${err.message}`);
    return false;
  }
}

function main() {
  console.log(`📣 Đang phát thông báo tới điện thoại: "${title}"...`);
  sendNtfy();
  sendTelegram();
}

main();
