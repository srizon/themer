import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Color Palette Generator",
  description: "Generate beautiful color palettes for your design projects",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        {children}
        {GA_MEASUREMENT_ID ? (
          <Suspense fallback={null}>
            <GoogleAnalytics />
          </Suspense>
        ) : null}
      </body>
    </html>
  );
}
