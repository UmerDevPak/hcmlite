import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { AuthProvider } from "@/context/AuthContext";
import { QueryProvider } from "@/context/QueryProvider";

export const metadata = {
  title: "HCM Lite | Enterprise Human Capital Management",
  description: "Enterprise-grade Human Capital Management platform built with Next.js and Firebase",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased selection:bg-indigo-500 selection:text-white">
        <QueryProvider>
          <ThemeProvider>
            <NotificationProvider>
              <AuthProvider>{children}</AuthProvider>
            </NotificationProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
