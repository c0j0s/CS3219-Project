import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: "/:path*",
};

export async function middleware(request: NextRequest) {
  console.log(process.env);
  
  const host = process.env.ENDPOINT || "http://localhost"
  const stage = process.env.BUILD_ENV || "development";

  // Needs to support cloud development deployment without port number
  const port = host.startsWith('https') ? '' : ':5050';
  const authValidateEndpoint = `${host}${port}/auth/api/validate`;

  const publicContent = ["/_next", "/assets", "/logout", "/forgotpassword"];

  if (publicContent.some((path) => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const jwtCookieString = request.cookies.get("jwt")?.value as string;
  console.log(authValidateEndpoint);
  
  // Can try passing cookie as parameter to validateUser for validation
  const res = await fetch(authValidateEndpoint, {
    method: "POST",
    headers: {
      Cookie: `jwt=${jwtCookieString}`,
    },
  });

  //authenticated
  console.log(res.status);
  
  if (res.status === 200) {
    if (
      request.nextUrl.pathname === "/login" ||
      request.nextUrl.pathname === "/" ||
      request.nextUrl.pathname === "/verify"
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.nextUrl.origin));
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
  return NextResponse.redirect(new URL("/login", request.nextUrl.origin));
}
