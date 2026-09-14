import { verifyJWT } from "@/lib/auth";
import { getClientPromise } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { getCorsHeaders } from "@/lib/cors";

const DB_NAME = process.env.DB_NAME;

export async function OPTIONS(request) {
  const origin = request.headers.get("origin");

  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}

export async function GET(request) {
  const origin = request.headers.get("origin");

  try {
    const user = verifyJWT(request);

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized Request" },
        {
          status: 401,
          headers: getCorsHeaders(origin),
        }
      );
    }

    if (user.email !== process.env.ADMIN_USER) {
      return NextResponse.json(
        { message: "Admin only" },
        {
          status: 403,
          headers: getCorsHeaders(origin),
        }
      );
    }

    const client = await getClientPromise();
    const db = client.db(DB_NAME);

    const users = await db
      .collection("users")
      .find({})
      .project({
        password: 0,
      })
      .toArray();

    return NextResponse.json(users, {
      status: 200,
      headers: getCorsHeaders(origin),
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to fetch users" },
      {
        status: 500,
        headers: getCorsHeaders(origin),
      }
    );
  }
}