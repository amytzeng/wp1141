import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// 最小測試元件 - 不依賴任何 Context 或複雜邏輯
function TestApp() {
  return (
    <div style={{ 
      padding: '50px', 
      fontFamily: 'Arial', 
      textAlign: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      color: 'white'
    }}>
      <h1>✅ React 正常運行！</h1>
      <p>如果您看到這個頁面，說明 React 已成功運行</p>
      <p>現在將載入完整應用...</p>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TestApp />
  </StrictMode>,
)

