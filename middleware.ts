import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/",
  "/workflow(.*)",
  "/api/workflows(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Next.js 15 path-to-regexp v8 compatible explicit matchers
    "/",
    "/workflow/:path*",
    "/api/workflows/:path*",
  ],
};
