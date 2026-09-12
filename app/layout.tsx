import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";

import "./globals.css";
import { CandidateLogger } from "@/components/candidate-logger";

export const metadata: Metadata = {
  title: "HexFlow — Visual Creative Workflow Studio",
  description: "Visual creative workflow layer for HexCoded. Change one creative decision without starting over.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  const content = (
    <html lang="en">
      <body className="font-sans antialiased">
        <CandidateLogger />
        {children}
      </body>
    </html>
  );

  if (!clerkKey) {
    return content;
  }

  return (
    <ClerkProvider publishableKey={clerkKey}>
      {content}
    </ClerkProvider>
  );
}
