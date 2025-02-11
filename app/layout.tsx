import type { Metadata } from "next";
import "./globals.css";
import { Lexend } from "next/font/google";

const lexend = Lexend({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-lexend",
});

export const metadata: Metadata = {
  title: "Zeni",
  description:
    "Manage your expenses with ease using Zeni. Create budgets, track transactions, and gain valuable financial insights.",
  openGraph: {
    title: "Zeni - Expense Management App",
    description:
      "Manage your expenses with ease using Zeni. Create budgets, track transactions, and gain valuable financial insights.",
    url: "https://zeni-ericgng.vercel.app/",
    siteName: "Zeni",
    images: [
      {
        url: "/thumbnail.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zeni - Expense Management App",
    description:
      "Manage your expenses with ease using Zeni. Create budgets, track transactions, and gain valuable financial insights.",
    images: ["/thumbnail.png"],
  },
  icons: {
    icon: "/meta_icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${lexend.variable} font-lexend antialiased`}>
        {children}
      </body>
    </html>
  );
}
