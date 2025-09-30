import { authkitMiddleware } from "@workos-inc/authkit-nextjs";

export default authkitMiddleware({
  debug: true,
  middlewareAuth: {
    enabled: true,
    unauthenticatedPaths: ["/api/auth"],
  },
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
