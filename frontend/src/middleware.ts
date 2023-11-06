import { NextRequest, NextResponse } from "next/server";

export const config = {
  // consume middleware for all API routes
  matcher: "/:path*",
};

export async function middleware(request: NextRequest) {
  const host = process.env.ENDPOINT || "http://localhost";

  // Needs to support cloud endpoint deployment without port number
  const port = host.startsWith("https") ? "" : ":5050";
  const authValidateEndpoint = `${host}${port}/auth/api/validate`;

  const publicRoutes = ["/_next", "/assets", "/logout", "/forgotpassword"];

  // no need to validate the token for these routes
  if (publicRoutes.some((path) => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const rerouteContents = ["/login", "/", "/verify", "/error"];

  const jwtCookieString = request.cookies.get("jwt")?.value as string;

  let isAuthenticated = false;

  try {
    const res = await fetch(authValidateEndpoint, {
      method: "POST",
      headers: {
        Cookie: `jwt=${jwtCookieString}`,
      },
    });

    if (res.status === 200) {
      isAuthenticated = true;
    }
  } catch (err) {
    // handles error when auth service is down
    if (request.nextUrl.pathname !== "/error") {
      return NextResponse.redirect(new URL("/error", request.nextUrl.origin));
    }
  }

  //authenticated
  if (isAuthenticated) {
    if (rerouteContents.includes(request.nextUrl.pathname)) {
      return NextResponse.redirect(
        new URL("/dashboard", request.nextUrl.origin)
      );
    }
    return NextResponse.next();
  }

  //not authenticated
  if (rerouteContents.includes(request.nextUrl.pathname)) {
    return NextResponse.next();
  }
  return NextResponse.redirect(new URL("/login", request.nextUrl.origin));
}
