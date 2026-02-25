import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const AUTH_WHITELIST = ["/api/auth", "/api/auth/login", "/api/auth/register"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect API routes
  if (!pathname.startsWith("/api")) return NextResponse.next();

  // Allowlisted auth routes
  if (AUTH_WHITELIST.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : req.cookies.get("token")?.value;

  if (!token) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" }
    });
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret");
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch (err) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" }
    });
  }
}

export const config = {
  matcher: ["/api/:path*"]
};

