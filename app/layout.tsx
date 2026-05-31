import type { Metadata } from "next";

import "./globals.css";
import { CandidateLogger } from "@/components/candidate-logger";

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
        <CandidateLogger />
        {children}
      </body>
    </html>
  );
}
