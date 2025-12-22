import type { Metadata, Viewport } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import AutoRefresh from "@/components/AutoRefresh";

export const metadata: Metadata = {
  title: "Pandey's Household",
  description: "Manage your household - recipes, shopping lists, and reminders",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#10b981',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className="antialiased bg-slate-50">
        <AutoRefresh />
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 pt-16 lg:pt-0">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
