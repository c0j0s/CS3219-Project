import { NextRequest, NextResponse } from "next/server";
export const config = {
  matcher: "/:path*",
};

export async function middleware(request: NextRequest) {
  const host = process.env.ENDPOINT || "http://localhost";

  // Needs to support cloud endpoint deployment without port number
  const port = host.startsWith("https") ? "" : ":5050";
  const authValidateEndpoint = `${host}${port}/auth/api/validate`;

  const publicContent = ["/_next", "/assets", "/logout", "/forgotpassword"];

  if (publicContent.some((path) => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const reRouteContent = ["/login", "/", "/verify", "/error"];

  const jwtCookieString = request.cookies.get("jwt")?.value as string;
  console.log(authValidateEndpoint);

  let isAuthenticated = false;

  try {
    const res = await fetch(authValidateEndpoint, {
      method: "POST",
      headers: {
        Cookie: `jwt=${jwtCookieString}`,
      },
    });

    // handles error when user service is down
    if (res.status === 503) {
      if (request.nextUrl.pathname !== "/error") {
        return NextResponse.redirect(new URL("/error", request.nextUrl.origin));
      }
    }

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
    if (reRouteContent.includes(request.nextUrl.pathname)) {
      return NextResponse.redirect(
        new URL("/dashboard", request.nextUrl.origin)
      );
    }
    return NextResponse.next();
  }

  //not authenticated
  if (reRouteContent.includes(request.nextUrl.pathname)) {
    return NextResponse.next();
  }
  return NextResponse.redirect(new URL("/login", request.nextUrl.origin));
}
