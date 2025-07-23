import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ChatProvider } from "./_contexts/ChatContext";
import { SearchProvider } from "./_contexts/SearchContext";
import AuthProvider from "./_components/AuthProvider";
import ClientLayout from "./_components/ClientLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AntiGambling.ai",
  description: "A tool to help you stay away from gambling",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/images/logo.png", type: "image/png" }
    ],
    shortcut: "/favicon.ico",
    apple: "/images/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-950`}
      >
        <AuthProvider>
          <SearchProvider>
            <ChatProvider>
              <ClientLayout>
                {children}
              </ClientLayout>
            </ChatProvider>
          </SearchProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
