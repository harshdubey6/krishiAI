import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NextAuthProvider } from "@/components/providers/NextAuthProvider";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextAuthProvider>
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
        </NextAuthProvider>
      </body>
    </html>
  );
}
