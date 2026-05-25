export const frontofficeProtectedRoutePrefixes = [
  "/spin",
  "/giveaways/mine",
  "/orders",
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
  if (pathname.startsWith("/orders/") && pathname.length > "/orders/".length) {
    return false; // Allow guests to view specific requests via code
  }
  return frontofficeProtectedRoutePrefixes.some((prefix) => matchesRoutePrefix(pathname, prefix));
}
