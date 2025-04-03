import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import Navbar from '@/components/navbar';
import AuthProvider from '@/components/auth-provider';
import LoadingWrapper from '@/components/LaodingWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LoveBite.ai - Relationship Compatibility Testing',
  description: 'Discover your relationship compatibility with AI-powered insights',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          >
          <Navbar />
          <LoadingWrapper>
          <main className="min-h-screen">{children}</main>
          </LoadingWrapper>
          <Toaster />
        </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}