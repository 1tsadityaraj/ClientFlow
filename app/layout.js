import { Geist, Geist_Mono } from "next/font/google";
import "../src/app/globals.css";
import { Providers } from "./Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "ClientFlow – Agency Client Portal",
  description: "Multitenant client portal for modern agencies.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950 text-zinc-50`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

