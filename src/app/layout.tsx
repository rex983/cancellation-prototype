import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BBD Cancellation Prototype",
  description: "Big Buildings Direct — order cancellation workflow prototype",
};

const NAV = [
  { href: "/", label: "Home" },
  { href: "/sales", label: "Sales (Pre-STM)" },
  { href: "/bst", label: "BST (Post-STM)" },
  { href: "/cancellations", label: "Cancellations" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <header className="border-b bg-card">
          <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-md bg-primary text-primary-foreground grid place-items-center font-bold">
                BBD
              </div>
              <div>
                <div className="font-semibold leading-tight">Big Buildings Direct</div>
                <div className="text-xs text-muted-foreground leading-tight">
                  Cancellation Prototype
                </div>
              </div>
            </Link>
            <nav className="flex items-center gap-1">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-2 text-sm rounded-md hover:bg-accent transition"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="flex-1">
          <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
        </main>
        <footer className="border-t bg-card">
          <div className="mx-auto max-w-6xl px-6 py-4 text-xs text-muted-foreground">
            Prototype — fake data only. State resets on server restart.
          </div>
        </footer>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
