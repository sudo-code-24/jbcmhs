import "./globals.css";
import { Outfit } from "next/font/google";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RouteTransition from "@/components/RouteTransition";
import RouteLoadingBar from "@/components/RouteLoadingBar";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { SiteBroadcastListener } from "@/components/SiteBroadcastListener";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jose B. Cardenas Mem HS",
  description: "School information, announcements, and calendar",
  manifest: "/manifest.json",
  /** iOS 16.4+ home-screen Web Push expects a capable web app declaration. */
  appleWebApp: {
    capable: true,
    title: "JBCMHS",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/jbcmhs_logo.png",
    shortcut: "/jbcmhs_logo.png",
    apple: "/jbcmhs_logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={outfit.variable} suppressHydrationWarning>
      <body className="min-h-screen font-sans">
        <ThemeProvider>
          <Toaster />
          <SiteBroadcastListener />
          <RouteLoadingBar />
          <Header />
          <main className="min-h-screen pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] md:pb-0">
            <RouteTransition>{children}</RouteTransition>
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
