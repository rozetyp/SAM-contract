import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'BidBeacon - SAM.gov Contract Alerts | Daily Email Digest $19/mo',
  description: 'Get daily SAM.gov contract opportunities delivered to your inbox. Guided filters, noise control, amendments auto-filtered. One saved search, $19/month.',
  keywords: 'SAM.gov, government contracts, federal contracting, contract alerts, email digest, NAICS, PSC, set-aside programs',
  authors: [{ name: 'BidBeacon' }],
  creator: 'BidBeacon',
  publisher: 'BidBeacon',
  robots: 'index, follow',
  openGraph: {
    title: 'BidBeacon - SAM.gov Contract Alerts',
    description: 'Daily email digest of SAM.gov contract opportunities with guided filters and noise control. $19/month subscription.',
    type: 'website',
    locale: 'en_US',
    siteName: 'BidBeacon',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BidBeacon - SAM.gov Contract Alerts',
    description: 'Daily email digest of SAM.gov contract opportunities with guided filters and noise control.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#667eea',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}