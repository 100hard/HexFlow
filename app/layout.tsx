import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";

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
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_bm90YWJsZS1wb255LTkuY2xlcmsuYWNjb3VudHMuZGV2JA"}>
      <html lang="en">
        <body className="font-sans antialiased">
          <CandidateLogger />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
