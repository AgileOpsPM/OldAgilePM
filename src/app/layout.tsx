import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AuthProvider from './components/AuthProvider'; // <-- IMPORT THE NEW COMPONENT

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Agile PM Tool',
  description: 'Your project management solution',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Wrap the children with the AuthProvider */}
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}