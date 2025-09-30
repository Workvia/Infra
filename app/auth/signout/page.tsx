import { getSignOutUrl } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";

export default async function SignOutPage() {
  const signOutUrl = await getSignOutUrl();
  redirect(signOutUrl);
}