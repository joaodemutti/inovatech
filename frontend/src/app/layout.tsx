import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { Providers } from '@/lib/providers';
import './globals.css';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });

export const metadata: Metadata = {
  title: 'INOVATECH — Clínica Vida Plena',
  description: 'Plataforma moderna de gestão clínica',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
