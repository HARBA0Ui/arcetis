"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { ProtectedShellLoading } from "@/components/layout/protected-shell-loading";
import { useNavigationProgress } from "@/components/navigation/navigation-provider";
import { useMe } from "@/hooks/useAuth";
import { useAuthToken } from "@/hooks/use-auth-token";
import { isSessionError } from "@/lib/api";
import { isFrontofficeProtectedRoute } from "@/lib/frontoffice-routes";
import { getSafeRedirectPath } from "@/lib/navigation";

function subscribeToHydration() {
  return () => undefined;
}

export function RouteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { startNavigation } = useNavigationProgress();
  const mounted = useSyncExternalStore(subscribeToHydration, () => true, () => false);
  const token = useAuthToken();
  const isProtectedRoute = isFrontofficeProtectedRoute(pathname);
  const me = useMe({ bootstrap: mounted && isProtectedRoute && !token });
  const hasToken = mounted ? !!token : false;
  const hasVerifiedSession = hasToken || !!me.data;
  const shouldRedirect =
    mounted &&
    isProtectedRoute &&
    !hasVerifiedSession &&
    me.isFetched &&
    (!me.isError || isSessionError(me.error, { includeNotFound: true }));

  useEffect(() => {
    if (!shouldRedirect) return;

    const redirectPath = getSafeRedirectPath(
      `${pathname}${typeof window !== "undefined" ? window.location.search : ""}`,
      "/"
    );
    const target = `/login?redirect=${encodeURIComponent(redirectPath)}`;
    startNavigation(target);
    router.replace(target);
  }, [pathname, router, shouldRedirect, startNavigation]);

  if (!isProtectedRoute) {
    return <>{children}</>;
  }

  if (!mounted || (!hasVerifiedSession && !me.isFetched)) {
    return (
      <ProtectedShellLoading
        message="Opening your Arcetis workspace..."
      />
    );
  }

  if (!hasVerifiedSession) {
    return (
      <ProtectedShellLoading
        message={
          me.isError && !isSessionError(me.error, { includeNotFound: true })
            ? "We could not verify your session right now."
            : "Redirecting to sign in..."
        }
      />
    );
  }

  return <AppShell>{children}</AppShell>;
}
