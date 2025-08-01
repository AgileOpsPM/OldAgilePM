import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AuthProvider from './components/(project & task comps)/AuthProvider'; // <-- IMPORT THE NEW COMPONENT
import Sidebar from './components/Sidebar';
import { getServerSession as nextGetServerSession } from "next-auth/next";
// Update the import path below to the correct location of authOptions
// Example: import { authOptions } from "../api/auth/[...nextauth]/authOptions";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Agixle PM Tool',
  description: 'Your project management solution',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();

  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {session ? (
            <div className="flex min-h-screen">
              <Sidebar />
              <main className="flex-1">{children}</main>
            </div>
          ) : (
            children
          )}
        </AuthProvider>
      </body>
    </html>
  );
}
async function getServerSession() {
  return await nextGetServerSession(authOptions);
}
