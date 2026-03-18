import "./globals.css";
import { Outfit } from "next/font/google";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RouteTransition from "@/components/RouteTransition";
import RouteLoadingBar from "@/components/RouteLoadingBar";
import { ThemeProvider } from "@/components/theme-provider";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jose B. Cardenas Mem HS",
  description: "School information, announcements, and calendar",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={outfit.variable} suppressHydrationWarning>
      <body className="min-h-screen font-sans">
        <ThemeProvider>
          <RouteLoadingBar />
          <Header />
          <main className="min-h-screen pb-24 md:pb-0">
            <RouteTransition>{children}</RouteTransition>
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
