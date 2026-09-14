import { verifyJWT } from "@/lib/auth";
import { getCorsHeaders } from "@/lib/cors";
import { errorResponse } from "@/lib/utils";
import { NextResponse } from "next/server";

export function GET(request) {
  const user = verifyJWT(request);

  if (!user) {
    return errorResponse("Unauthorized Request", 401, request.headers.get("origin"));
  }

  return NextResponse.json(user, {
    status: 200,
    headers: getCorsHeaders(request.headers.get("origin")),
  });
}