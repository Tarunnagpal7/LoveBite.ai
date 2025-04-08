"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (session?.user) {
      if (!session.user.profileCompleted && pathname !== "/profile-complete") {
        router.push("/profile-complete");
      } else if (session.user.profileCompleted && pathname === "/profile-complete") {
        router.push("/dashboard");
      }
    }
  }, [session, router, pathname]);

  return <>{children}</>;
}