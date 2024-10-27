import { Inter } from 'next/font/google';
import { getServerSession } from 'next-auth/next';
import { ClientProviders } from '@/components/providers/client-providers';
import { ThemeProvider } from '@/components/providers/theme-provider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider>
          <ClientProviders session={session}>
            {children}
          </ClientProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}