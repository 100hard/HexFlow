import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "NextFlow",
  description: "Workflow dashboard inspired by Galaxy.ai / Magica Flow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
