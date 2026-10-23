import type { Metadata, Viewport } from "next";
import { Baloo_2, Yatra_One } from "next/font/google";
import "./globals.css";

// Both fonts cover Latin and Devanagari, so Nepali renders correctly everywhere.
const baloo = Baloo_2({
  variable: "--font-baloo",
  weight: ["500", "700", "800"],
  subsets: ["latin", "devanagari"],
});

const yatra = Yatra_One({
  variable: "--font-yatra",
  weight: "400",
  subsets: ["latin", "devanagari"],
});

export const metadata: Metadata = {
  title: "Chhito! — The Climb to the Ballot",
  description: "Think fast. Climb fast. Vote. A live team quiz about Nepal and getting ready to vote.",
};

export const viewport: Viewport = {
  themeColor: "#FFFDF8",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${baloo.variable} ${yatra.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
