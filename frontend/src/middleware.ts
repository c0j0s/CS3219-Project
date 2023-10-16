import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: "/:path*",
};

export async function middleware(request: NextRequest) {
  const host =
    process.env.NODE_ENV == "production"
      ? process.env.ENDPOINT_PROD
      : process.env.ENDPOINT_DEV;

  const baseUrl =
    process.env.NODE_ENV == "production"
      ? `http://${host}`
      : `http://${process.env.ENDPOINT_DEV}:${process.env.ENDPOINT_FRONTEND_PORT}`;

  const authValidateEndpoint = `http://${host}:${process.env.ENDPOINT_AUTH_PORT}/api/auth/validate`;

  const publicContent = ["/_next", "/assets", "/logout", "/forgotpassword"];

  if (publicContent.some((path) => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const jwtCookieString = request.cookies.get("jwt")?.value as string;

  const res = await fetch(authValidateEndpoint, {
    method: "POST",
    headers: {
      Cookie: `jwt=${jwtCookieString}`,
    },
  });

  //authenticated
  if (res.status === 200) {
    if (
      request.nextUrl.pathname === "/login" ||
      request.nextUrl.pathname === "/" ||
      request.nextUrl.pathname === "/verify"
    ) {
      return NextResponse.redirect(new URL("/dashboard", baseUrl));
    }
    return NextResponse.next();
  }

  //not authenticated
  if (
    request.nextUrl.pathname === "/login" ||
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname === "/verify"
  ) {
    return NextResponse.next();
  }
  return NextResponse.redirect(new URL("/login", baseUrl));
}
