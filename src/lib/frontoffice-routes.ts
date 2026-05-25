export const frontofficeProtectedRoutePrefixes = [
  "/spin",
  "/giveaways",
  "/requests",
  "/referrals",
  "/profile"
] as const;

export const frontofficeProtectedRouteMatchers = frontofficeProtectedRoutePrefixes.map(
  (prefix) => `${prefix}/:path*`
);

export function matchesRoutePrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function isFrontofficeProtectedRoute(pathname: string) {
  if (pathname.startsWith("/requests/") && pathname.length > "/requests/".length) {
    return false; // Allow guests to view specific requests via code
  }
  return frontofficeProtectedRoutePrefixes.some((prefix) => matchesRoutePrefix(pathname, prefix));
}
