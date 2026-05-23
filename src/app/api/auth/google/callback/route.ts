import { NextResponse } from "next/server";
import { env } from "@/server/config/env";
import { getRequestOrigin, handleRouteError } from "@/server/api";
import { loginWithGoogleUser } from "@/server/services/auth.service";
import { setSessionCookie } from "@/server/utils/auth-cookies";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const stateParam = searchParams.get("state");
    const error = searchParams.get("error");

    if (error || !code) {
      const redirectPath = stateParam 
        ? JSON.parse(Buffer.from(stateParam, "base64").toString("utf-8")).callbackUrl 
        : "/";
      return NextResponse.redirect(new URL(`/login?error=GoogleAuthFailed&redirect=${encodeURIComponent(redirectPath)}`, getRequestOrigin(request)));
    }

    let callbackUrl = "/";
    if (stateParam) {
      try {
        const decoded = JSON.parse(Buffer.from(stateParam, "base64").toString("utf-8"));
        if (decoded.callbackUrl) {
          callbackUrl = decoded.callbackUrl;
        }
      } catch {
        // ignore
      }
    }

    const origin = getRequestOrigin(request);
    const redirectUri = `${origin}/api/auth/google/callback`;

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: env.AUTH_GOOGLE_ID!,
        client_secret: env.AUTH_GOOGLE_SECRET!,
        redirect_uri: redirectUri,
        grant_type: "authorization_code"
      })
    });

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange token with Google");
    }

    const tokens = await tokenResponse.json();
    
    // Fetch user info using the access token
    const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });

    if (!userResponse.ok) {
      throw new Error("Failed to fetch user profile from Google");
    }

    const profile = await userResponse.json();

    const result = await loginWithGoogleUser({
      email: profile.email,
      name: profile.name,
      googleId: profile.id
    });

    // We can't redirect with JSON, so we set the cookie and redirect to the frontend.
    // The GoogleSyncPanel is no longer needed since the cookie is set natively!
    // However, the frontend needs to know about the loginBonus (if any).
    // We can pass it via a query param or an intermediate route if needed, 
    // but typically loginBonus is just checked on the client side on load.
    
    const response = NextResponse.redirect(new URL(callbackUrl, origin));
    setSessionCookie(response, request, "frontoffice", result.sessionToken);

    return response;
  } catch (error) {
    return handleRouteError(error);
  }
}
