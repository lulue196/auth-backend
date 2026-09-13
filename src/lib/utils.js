import { NextResponse } from "next/server";
import corsHeaders from "./cors";

export function errorResponse(message, status = 500) {
  return NextResponse.json(
    { message },
    {
      status,
      headers: corsHeaders,
    }
  );
}