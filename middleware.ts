import { authkitMiddleware } from "@workos-inc/authkit-nextjs";

export default authkitMiddleware();

// Match all routes except static files and images
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
