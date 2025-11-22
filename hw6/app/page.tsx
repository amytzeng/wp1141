import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Line AI Chatbot - Learning Assistant</h1>
      <p style={{ marginTop: '1rem', marginBottom: '1rem' }}>
        This is the backend API for the Line AI Chatbot system.
      </p>
      <div style={{ marginTop: '2rem' }}>
        <h2>API Documentation</h2>
        <p style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
          <Link
            href="/api/swagger-ui"
            style={{
              color: '#0070f3',
              textDecoration: 'underline',
              fontSize: '1.1rem',
            }}
          >
            View Swagger UI Documentation →
          </Link>
        </p>
        <p style={{ marginTop: '0.5rem', marginBottom: '1rem', color: '#666' }}>
          Or access the OpenAPI spec directly:{' '}
          <Link
            href="/api/swagger"
            style={{ color: '#0070f3', textDecoration: 'underline' }}
          >
            /api/swagger
          </Link>
        </p>
      </div>
      <div style={{ marginTop: '2rem' }}>
        <h2>Available Endpoints</h2>
        <ul style={{ marginTop: '1rem', listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong>POST /api/webhook/line</strong> - Line webhook endpoint
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong>GET /api/health</strong> - Health check
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong>GET /api/admin/conversations</strong> - List conversations
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong>GET /api/admin/conversations/[id]</strong> - Get conversation details
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong>GET /api/admin/stats</strong> - Get statistics
          </li>
        </ul>
      </div>
      <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: '#e2f0ef', borderRadius: '8px', border: '1px solid #a9d4d6' }}>
        <h2 style={{ color: '#065758', marginBottom: '1rem' }}>管理後台</h2>
        <p style={{ marginBottom: '1rem' }}>
          <Link
            href="/admin"
            style={{
              color: '#065758',
              textDecoration: 'underline',
              fontSize: '1.1rem',
              fontWeight: '600',
            }}
          >
            前往管理後台 Dashboard →
          </Link>
        </p>
        <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666' }}>
          <p>管理後台功能：</p>
          <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
            <li>Dashboard - 統計總覽與五大方向分類</li>
            <li>對話列表 - 搜尋與篩選對話記錄</li>
            <li>對話詳情 - 查看使用者對話內容</li>
            <li>分類統計 - 分類分析與趨勢圖表</li>
            <li>Bot 配置 - 管理 AI 回覆設定</li>
          </ul>
        </div>
      </div>
    </main>
  );
}

