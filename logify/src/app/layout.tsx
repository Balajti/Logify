import { Inter } from 'next/font/google';
import { getServerSession } from 'next-auth/next';
import { ClientProviders } from '@/components/providers/client-providers';
import { ThemeProvider } from '@/components/providers/theme-provider';
import './globals.css';
import { authOptions } from '@/lib/auth';
import Head from 'next/head';

const inter = Inter({ subsets: ['latin'] });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" suppressHydrationWarning>
      <Head>
        {/* General SEO */}
        <title>Logify</title>
        <meta
          name="description"
          content="Logify offers an all-in-one time tracking and project management solution to boost productivity, manage tasks, and streamline workflows for your team."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />
        <link rel="icon" href="/favicon.ico" />

        {/* Open Graph */}
        <meta property="og:title" content="Logify | Time Tracking & Project Management Solution" />
        <meta
          property="og:description"
          content="Boost your team's productivity with Logify. Manage tasks, track time, and collaborate efficiently using our powerful tools."
        />
        <meta property="og:image" content="/og-image.png" />
        <meta property="og:url" content="https://your-domain.com" />
        <meta property="og:type" content="website" />

        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Logify | Time Tracking & Project Management Solution" />
        <meta
          name="twitter:description"
          content="Logify offers an all-in-one time tracking and project management solution to boost productivity and streamline workflows."
        />
        <meta name="twitter:image" content="/twitter-card.png" />
      </Head>
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
