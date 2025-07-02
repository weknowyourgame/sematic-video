"use client";

import { useSession } from "~/lib/auth-client";
import SignInModal from "~/components/sign-in-modal";
import UserMenu from "~/components/user-menu";

export default function AuthHeader() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
      </div>
    );
  }

  if (status !== "authenticated" || !session?.user) {
    return <SignInModal />;
  }

  return <UserMenu />;
} 