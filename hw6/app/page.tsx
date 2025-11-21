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
      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <p>
          <strong>Note:</strong> The admin dashboard will be implemented in the frontend phase.
        </p>
      </div>
    </main>
  );
}

