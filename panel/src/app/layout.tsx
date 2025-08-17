import type { Metadata } from "next";
import { Inter, Fira_Code } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const firaMono = Fira_Code({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Entelequia Track",
  description: "Tu plataforma logística inteligente para el seguimiento y gestión de entregas en tiempo real",
  manifest: "/manifest.json",
  icons: {
    icon: "/entelequia-favicon.png",
    shortcut: "/entelequia-favicon.png",
    apple: "/entelequia-favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${firaMono.variable} antialiased bg-gray-50 text-gray-900`}>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
