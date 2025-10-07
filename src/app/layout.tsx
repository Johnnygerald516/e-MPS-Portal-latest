import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "../components/theme-provider";
import { AuthProvider } from "../contexts/auth-context"
import { NavigationProvider } from "../contexts/navigation-context";
import { LanguageProvider } from "../contexts/language-context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "E-Migrant Portal | Immigration Service Department",
  description: "Modern web portal for migrant services",
  icons: {
    icon: "/immigration_logo.png",
    shortcut: "/immigration_logo.png",
    apple: "/immigration_logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/immigration_logo.png" type="image/png" />
        <link rel="shortcut icon" href="/immigration_logo.png" type="image/png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background overflow-x-hidden`}
        style={{ minHeight: '100vh' }}
      >
        <ThemeProvider
          defaultTheme="system" 
          storageKey="theme"
        >
          <AuthProvider>
            <LanguageProvider>
              <NavigationProvider>
                {children}
              </NavigationProvider>
            </LanguageProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
