import { NextResponse } from "next/server";
import { getCorsHeaders } from "./cors";

export function errorResponse(message, status = 500, origin) {
  return NextResponse.json(
    { message },
    {
      status,
      headers: getCorsHeaders(origin),
    }
  );
}