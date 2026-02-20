import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { NextAuthProvider } from "@/components/providers/NextAuthProvider";
import { LanguageProvider } from "@/components/providers/LanguageProvider";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "KrishiAI - AI-Powered Agriculture Platform for Farmers",
  description: "Empowering farmers with AI crop diagnosis, weather alerts, market prices, and direct buyer connections. Get instant solutions for crop diseases, fair prices, and farming guidance.",
  keywords: "agriculture, farming, crop disease, AI diagnosis, weather alerts, mandi prices, farmer marketplace, किसान, खेती",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${sora.variable} antialiased`}
      >
        <NextAuthProvider>
          <LanguageProvider>
            <Toaster position="top-right" toastOptions={{
              duration: 3000,
              style: {
                background: '#333',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#22c55e',
                },
              },
              error: {
                style: {
                  background: '#ef4444',
                },
              },
            }} />
            {children}
          </LanguageProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
