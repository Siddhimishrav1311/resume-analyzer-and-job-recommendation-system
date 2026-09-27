import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CareerMatch | Find work that fits",
  description:
    "Upload your resume.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}