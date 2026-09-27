import { getClientPromise } from "@/lib/mongodb";
import { verifyJWT } from "@/lib/auth";
import { errorResponse } from "@/lib/utils";
import { NextResponse } from "next/server";
import { getCorsHeaders } from "@/lib/cors";

export async function GET(request) {
  const origin = request.headers.get("origin");

  const user = verifyJWT(request);

  if (!user) {
    return errorResponse("Unauthorized Request", 401, origin);
  }

  try {
    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME);

    const itemList = await db
      .collection("item")
      .find({ status: "ACTIVE" })
      .toArray();

    return NextResponse.json(
      { itemList },
      {
        status: 200,
        headers: getCorsHeaders(origin),
      }
    );
  } catch (error) {
    console.error("GET Items", error);
    return errorResponse("GET Item Internal Error", 500, origin);
  }
}

export async function POST(request) {
  const origin = request.headers.get("origin");

  const user = verifyJWT(request);

  if (!user) {
    return errorResponse("Unauthorized Request", 401, origin);
  }

  try {
    const data = await request.json();

    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME);

    const insertResult = await db.collection("item").insertOne({
  name: data.name,
  category: data.category,
  price: data.price,
  amount: data.amount,
  status: "ACTIVE",
});

await db.collection("audit_log").insertOne({
  action: "CREATE_ITEM",
  user: user.email,
  itemId: insertResult.insertedId,
  timestamp: new Date(),
});

return NextResponse.json(
  { id: insertResult.insertedId },
      {
        status: 201,
        headers: getCorsHeaders(origin),
      }
    );
  } catch (error) {
    console.error("POST Items", error);
    return errorResponse("POST Item Internal Error", 500, origin);
  }
}

export async function OPTIONS(request) {
  const origin = request.headers.get("origin");

  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}