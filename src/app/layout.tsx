import type { Metadata } from "next";
import { Outfit, Fredoka } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const fredoka = Fredoka({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-patified",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Patified - Patifique seus amigos",
  description: "Patified - Patifique seus amigos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${outfit.variable} ${fredoka.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
