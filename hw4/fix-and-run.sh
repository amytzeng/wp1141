#!/bin/bash

echo "🔧 Fixing and Starting My MapBook..."

# 停止舊進程
echo "Stopping old processes..."
pkill -f "nodemon" 2>/dev/null
pkill -f "vite" 2>/dev/null
sleep 2

# 修復後端
echo "Fixing backend..."
cd backend
rm -rf node_modules/.prisma
npx prisma generate
echo "✅ Backend fixed"

# 啟動後端
echo "Starting backend..."
npm run dev > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend started with PID: $BACKEND_PID"
sleep 3

# 測試後端
echo "Testing backend..."
if curl -s http://localhost:5000/health > /dev/null; then
    echo "✅ Backend is running!"
else
    echo "❌ Backend failed to start. Check /tmp/backend.log"
    exit 1
fi

# 啟動前端
echo "Starting frontend..."
cd ../frontend
npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend started with PID: $FRONTEND_PID"
sleep 3

# 獲取前端端口
FRONTEND_PORT=$(grep -o "Local:.*http://localhost:[0-9]*" /tmp/frontend.log 2>/dev/null | grep -o "[0-9]*" | head -1)
if [ -z "$FRONTEND_PORT" ]; then
    FRONTEND_PORT=5173
fi

echo ""
echo "✅ All services are running!"
echo "📡 Backend: http://localhost:5000"
echo "🌐 Frontend: http://localhost:$FRONTEND_PORT"
echo ""
echo "To stop servers, run: kill $BACKEND_PID $FRONTEND_PID"
