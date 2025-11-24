import type { Metadata } from 'next';
import './globals.css';
import ThemeRegistry from '@/components/ThemeRegistry/ThemeRegistry';
import MainLayout from '@/components/Layout/MainLayout';

export const metadata: Metadata = {
  title: 'Twilio India Demo',
  description: 'Next.js demo showcasing Twilio Voice, IVR, Video, SMS for India',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <MainLayout>
            {children}
          </MainLayout>
        </ThemeRegistry>
      </body>
    </html>
  );
}


