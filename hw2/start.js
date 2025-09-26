#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🎮 啟動塔防遊戲...');
console.log('📁 遊戲目錄:', __dirname);
console.log('🌐 服務器將在 http://localhost:3000 啟動');
console.log('⏹️  按 Ctrl+C 停止服務器\n');

// 啟動 http-server
const server = spawn('npx', ['http-server', '-p', '3000', '-o', '-c-1'], {
  stdio: 'inherit',
  shell: true
});

server.on('error', (err) => {
  console.error('❌ 啟動服務器時發生錯誤:', err.message);
  console.log('\n💡 請確保已安裝 Node.js 和 npm');
  console.log('💡 如果沒有安裝，請先運行: npm install');
});

server.on('close', (code) => {
  console.log(`\n👋 服務器已停止 (退出碼: ${code})`);
});

// 處理 Ctrl+C
process.on('SIGINT', () => {
  console.log('\n🛑 正在停止服務器...');
  server.kill('SIGINT');
  process.exit(0);
});
