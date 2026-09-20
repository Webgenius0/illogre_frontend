import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const host = request.nextUrl.origin || "http://localhost:3000";

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const redirectUri = `${host}/auth/callback`;

  const isValidClientId =
    clientId &&
    clientId.trim() !== "" &&
    clientId !== "undefined" &&
    clientId !== "your_client_id_here" &&
    clientId.includes(".apps.googleusercontent.com");

  if (!isValidClientId) {
    return NextResponse.redirect(
      `${host}/auth/callback?error=missing_client_id`
    );
  }

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=openid%20profile%20email&state=google_auth&prompt=select_account`;

  return NextResponse.redirect(googleAuthUrl);
}

