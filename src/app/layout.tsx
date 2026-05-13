import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { RoleSwitcher } from "@/components/role-switcher";
import { NavLinks } from "@/components/nav-links";
import { getRole } from "@/lib/roles.server";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const role = await getRole();
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <header className="border-b bg-card">
            <div className="mx-auto max-w-6xl px-6 py-4 flex flex-wrap items-center gap-4 justify-between">
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
                <NavLinks role={role} />
              </nav>
              <div className="flex items-center gap-2">
                <RoleSwitcher current={role} />
                <ThemeToggle />
              </div>
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
        </ThemeProvider>
      </body>
    </html>
  );
}
