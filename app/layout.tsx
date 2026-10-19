import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Airframe | Rate your flight',
  description: 'Rate your flight experience, from your seat to your service.',
  icons: { icon: '/favicon.svg', shortcut: '/favicon.svg' },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
