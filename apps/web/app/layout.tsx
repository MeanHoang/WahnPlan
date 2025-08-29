import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "WahnPlan",
  description: "Efficient project management platform",
};

export default function RootLayout({
  children,
}: {
  children: any;
}): JSX.Element {
  return (
    <html lang="en">
      <body className={inter.variable} suppressHydrationWarning={true}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
