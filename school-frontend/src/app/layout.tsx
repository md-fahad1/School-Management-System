import type { Metadata } from "next";
import { Rubik, Roboto } from "next/font/google";
import "./globals.css";
import ReduxProvider from "@/redux/Provider";
import { ToastProvider } from "@/components/ui/ToastProvider";
// Load the fonts

const rubik = Rubik({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-rubik",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "School Management",
  description: "Next.js School Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={` ${rubik.variable} ${roboto.variable}`}>
      <body>
        <ReduxProvider><ToastProvider>{children}</ToastProvider></ReduxProvider>
      </body>
    </html>
  );
}
