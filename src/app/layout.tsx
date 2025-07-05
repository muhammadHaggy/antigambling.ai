import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "./_components/Sidebar";
import { ChatProvider } from "./_contexts/ChatContext";
import AuthProvider from "./_components/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Character.ai Clone",
  description: "A Character.ai clone built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-950`}
      >
        <AuthProvider>
          <ChatProvider>
            <div className="flex">
              <Sidebar />
              <main className="flex-1 ml-64 min-h-screen">
                {children}
              </main>
            </div>
          </ChatProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
