import { getCorsHeaders } from "@/lib/cors";
import { getClientPromise } from "@/lib/mongodb";
import { errorResponse } from "@/lib/utils";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET;
const adminUser = process.env.ADMIN_USER;
const adminPass = process.env.ADMIN_PASS;
const DB_NAME = process.env.DB_NAME;

export async function POST(req) {
  const origin = req.headers.get("origin");
  const data = await req.json();
  const { email, password } = data;

  if (!email || !password) {
    return errorResponse("Missing email or password", 400, origin);
  }

  const admin = checkAdmin(email, password);
  const user = !admin ? await checkUser(email, password) : admin;

  if (user) {
    const token = getJwtToken(user);

    const response = NextResponse.json(
      {
        message: "Login successful",
      },
      {
        status: 200,
        headers: getCorsHeaders(origin),
      }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "development" ? "lax" : "none",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } else {
    return errorResponse("Invalid email or password", 401, origin);
  }
}

function checkAdmin(email, password) {
  if (!adminUser || !adminPass) return false;

  if (adminUser === email && adminPass === password) {
    return {
      _id: "-1",
      email: email,
      username: "admin",
    };
  }

  return false;
}

async function checkUser(email, password) {
  try {
    const client = await getClientPromise();
    const db = client.db(DB_NAME);

    const user = await db.collection("user").findOne({ email });

    if (!user) return false;

    const check = await bcrypt.compare(password, user.password);

    if (!check) {
      return false;
    }

    return user;
  } catch (error) {
    console.log("exception", error.toString());
    return false;
  }
}

function getJwtToken(user) {
  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
      username: user.username,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  return token;
}
export async function OPTIONS(request) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(request.headers.get("origin")),
  });
}