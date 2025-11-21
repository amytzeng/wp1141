import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Line AI Chatbot - Learning Assistant',
  description: 'An intelligent chatbot system integrated with Line Messaging API',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

