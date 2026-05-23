import { NextResponse } from "next/server";
import { env } from "@/server/config/env";
import { getRequestOrigin } from "@/server/api";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!env.AUTH_GOOGLE_ID) {
    return NextResponse.json({ message: "Google auth is not configured" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const origin = getRequestOrigin(request);
  const redirectUri = `${origin}/api/auth/google/callback`;

  // Encode the redirect URL inside the state parameter so we know where to send them
  const state = Buffer.from(JSON.stringify({ callbackUrl })).toString("base64");

  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleAuthUrl.searchParams.set("client_id", env.AUTH_GOOGLE_ID);
  googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
  googleAuthUrl.searchParams.set("response_type", "code");
  googleAuthUrl.searchParams.set("scope", "openid email profile");
  googleAuthUrl.searchParams.set("access_type", "online");
  googleAuthUrl.searchParams.set("state", state);
  googleAuthUrl.searchParams.set("prompt", "select_account");

  return NextResponse.redirect(googleAuthUrl.toString());
}
