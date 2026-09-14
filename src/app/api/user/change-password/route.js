import bcrypt from "bcrypt";
import { verifyJWT } from "@/lib/auth";
import { getClientPromise } from "@/lib/mongodb";
import { errorResponse } from "@/lib/utils";
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

export async function PUT(request) {
  try {
    const origin = request.headers.get("origin");
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

    // Only admin can change user password
    if (user.email !== process.env.ADMIN_USER) {
      return NextResponse.json(
        { message: "Admin only" },
        {
          status: 403,
          headers: getCorsHeaders(origin),
        }
      );
    }

    const body = await request.json();
    const { email, newPassword } = body;

    if (!email || !newPassword) {
      return NextResponse.json(
        { message: "Email and new password are required" },
        {
          status: 400,
          headers: getCorsHeaders(origin),
        }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const client = await getClientPromise();
    const db = client.db(DB_NAME);

    const result = await db.collection("users").updateOne(
      { email },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: "User not found" },
        {
          status: 404,
          headers: getCorsHeaders(origin),
        }
      );
    }

    return NextResponse.json(
      { message: "Password changed successfully" },
      {
        status: 200,
        headers: getCorsHeaders(origin),
      }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to change password" },
      {
        status: 500,
      }
    );
  }
}