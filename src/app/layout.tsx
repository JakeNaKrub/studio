import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/layout/header';
import { FirebaseClientProvider } from '@/firebase';

export const metadata: Metadata = {
  title: 'Common-Room Booking',
  description: 'Manage common room bookings.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased',
        )}
      >
        <FirebaseClientProvider>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 pt-16">{children}</main>
            <footer className="py-6 md:px-8 md:py-0">
                <div className="container mx-auto flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
                    <p className="text-center text-sm leading-loose text-muted-foreground">
                        Made by IT, ISESC 2025
                    </p>
                </div>
            </footer>
          </div>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
