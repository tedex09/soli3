import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import { PlatformGuard } from "@/components/platform-guard";
import { MobileLayout } from "@/components/mobile-layout";
import "./globals.css";
import { isMobileDevice } from "@/utils/client";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Content Request Hub",
  description: "Request new movies and TV shows, update existing content, or report issues",
  openGraph: {
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isMobile = isMobileDevice();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <PlatformGuard>
            {isMobile ? (
                <MobileLayout>{children}</MobileLayout>
            ) : (
                children
            )}
          </PlatformGuard>
        </Providers>
      </body>
    </html>
  );
}