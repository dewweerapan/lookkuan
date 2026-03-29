import type { Metadata, Viewport } from 'next';
import { Mali } from 'next/font/google';
import { Toaster } from 'sonner';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import Providers from '@/components/Providers';
import './globals.css';

const mali = Mali({
  subsets: ['thai', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-mali',
  display: 'swap',
});

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
    <html lang='th' suppressHydrationWarning className={mali.variable}>
      <head />
      <body className='min-h-screen bg-gray-50 dark:bg-gray-950'>
        <Providers>
          {children}
          <ServiceWorkerRegister />
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
        </Providers>
      </body>
    </html>
  );
}
