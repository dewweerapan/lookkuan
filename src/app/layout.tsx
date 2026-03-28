import type { Metadata, Viewport } from 'next';
import { Toaster } from 'sonner';
import './globals.css';

export const metadata: Metadata = {
  title: 'LookKuan - ระบบจัดการร้านเสื้อผ้า',
  description: 'ระบบ POS และจัดการร้านเสื้อผ้าครบวงจร สำหรับร้าน LookKuan',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'LookKuan',
  },
  icons: {
    apple: '/icons/icon-192.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 3, // allow zoom for accessibility
  userScalable: true,
  themeColor: '#F97316',
  viewportFit: 'cover', // support iPhone notch/home bar
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='th' suppressHydrationWarning>
      <head>
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link
          rel='preconnect'
          href='https://fonts.gstatic.com'
          crossOrigin='anonymous'
        />
      </head>
      <body className='min-h-screen bg-gray-50'>
        {children}
        <Toaster
          position='top-center'
          richColors
          toastOptions={{
            style: {
              fontSize: '16px',
              padding: '16px',
            },
          }}
        />
      </body>
    </html>
  );
}
