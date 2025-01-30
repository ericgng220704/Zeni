import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "./auth";

export async function middleware(req: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    const url = req.nextUrl.clone();
    url.pathname = "/sign-in";
    return NextResponse.redirect(url);
  }

  return NextResponse.next(); // Allow the request to proceed
}

export const config = {
  matcher: [
    "/",
    "/balances/:path*",
    "/expense/:path*",
    "/income/:path*",
    "/budgets/:path",
  ],
};
