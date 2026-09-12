import { auth, currentUser } from "@clerk/nextjs/server";

export async function getSessionUser() {
  const hasClerkKeys = Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY
  );

  if (!hasClerkKeys) {
    return {
      userId: "guest_creator",
      email: "creator@hexflow.studio",
    };
  }

  try {
    const { userId } = await auth();
    if (!userId) return null;

    const clerkUser = await currentUser().catch(() => null);
    const email = clerkUser?.emailAddresses[0]?.emailAddress || `${userId}@clerk.dev`;

    return { userId, email };
  } catch {
    return {
      userId: "guest_creator",
      email: "creator@hexflow.studio",
    };
  }
}
