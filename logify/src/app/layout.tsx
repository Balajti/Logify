import { Inter } from 'next/font/google';
import { getServerSession } from 'next-auth/next';
import { ClientProviders } from '@/components/providers/client-providers';
import { ThemeProvider } from '@/components/providers/theme-provider';
import './globals.css';
import { authOptions } from '@/lib/auth';
import { headers } from 'next/headers';

const inter = Inter({ subsets: ['latin'] });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = headers();
  console.log('Headers:', headersList);
  const session = await getServerSession(authOptions);
  console.log('Session:', session);

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