#!/bin/bash

echo "🚀 Starting My MapBook Application..."

# 啟動後端
echo "Starting backend server..."
cd backend
npm run dev > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend started with PID: $BACKEND_PID"

# 等待後端啟動
sleep 3

# 啟動前端
echo "Starting frontend server..."
cd ../frontend
npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend started with PID: $FRONTEND_PID"

echo ""
echo "✅ Application is running!"
echo "📡 Backend: http://localhost:5000"
echo "🌐 Frontend: http://localhost:5173"
echo ""
echo "To stop servers, run: kill $BACKEND_PID $FRONTEND_PID"

# 儲存 PIDs 以供稍後停止
echo "$BACKEND_PID $FRONTEND_PID" > /tmp/mapbook_pids.txt
