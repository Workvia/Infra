import { getUser } from "@workos-inc/authkit-nextjs";
import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET() {
  try {
    const { user } = await getUser();

    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Get or create user in Convex
    const convexUser = await convex.mutation(api.auth.getOrCreateUser, {
      workosId: user.id,
      email: user.email,
      name: user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.email,
    });

    return NextResponse.json({
      authenticated: true,
      user: {
        id: convexUser._id,
        email: convexUser.email,
        name: convexUser.name,
        role: convexUser.role,
        workspaceId: convexUser.workspaceId,
      },
    });
  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json(
      { authenticated: false, error: "Session check failed" },
      { status: 500 }
    );
  }
}