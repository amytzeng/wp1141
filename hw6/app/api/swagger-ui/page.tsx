'use client';

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

// Dynamically import SwaggerUI to avoid SSR issues
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function SwaggerUIPage() {
  return (
    <div style={{ padding: '1rem' }}>
      <h1 style={{ marginBottom: '1rem' }}>API Documentation</h1>
      <SwaggerUI url="/api/swagger" />
    </div>
  );
}

