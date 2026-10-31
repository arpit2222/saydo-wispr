import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'SayDo — Voice to AI Agent Skills & Policies',
  description: 'Record once by voice. Your web app works with every AI agent.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const appKey = process.env.NEXT_PUBLIC_APP_PUBLIC_KEY || process.env.NEXT_PUBLIC_APP_KEY || 'pk_demo_dehix';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[#090d16] text-slate-100">
        {children}
        <Script
          id="saydo-sdk"
          src="/sdk.js"
          strategy="afterInteractive"
          data-app={appKey}
          data-api={apiUrl}
        />
      </body>
    </html>
  );
}
