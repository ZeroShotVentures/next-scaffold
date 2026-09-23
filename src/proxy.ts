import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

// Optimistic check only: the cookie may be expired or revoked. Pages still
// call requireSession(). Signed-in users are redirected away from /sign-in by
// the page itself, since a stale cookie here would cause a redirect loop.
export function proxy(request: NextRequest) {
  if (getSessionCookie(request)) return NextResponse.next();

  const { pathname, search } = request.nextUrl;
  const signIn = new URL("/sign-in", request.url);
  signIn.searchParams.set("callbackURL", `${pathname}${search}`);
  return NextResponse.redirect(signIn);
}

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*", "/admin/:path*"],
};
