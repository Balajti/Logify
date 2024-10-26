import { Inter } from 'next/font/google';
import { getServerSession } from 'next-auth/next';
import { ClientProviders } from '@/components/providers/client-providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });


export async function generateMetadata({ params }: { params: { title: string } }) {
  return {
    title: `${params.title} | Logify`,
    description: 'Project Management and Time Tracking',
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ClientProviders session={session}>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}