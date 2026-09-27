import { getClientPromise } from "@/lib/mongodb";
import { verifyJWT } from "@/lib/auth";
import { errorResponse } from "@/lib/utils";
import { NextResponse } from "next/server";
import { getCorsHeaders } from "@/lib/cors";
import { ObjectId } from "mongodb";

export async function GET(request, { params }) {
  const origin = request.headers.get("origin");

  const user = verifyJWT(request);

  if (!user) {
    return errorResponse("Unauthorized Request", 401, origin);
  }

  try {
    const { item_id } = await params;

    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME);

    const item = await db.collection("item").findOne({
      _id: new ObjectId(item_id),
      status: "ACTIVE",
    });

    if (!item) {
      return errorResponse("Item not found", 404, origin);
    }

    return NextResponse.json(
      { item },
      {
        status: 200,
        headers: getCorsHeaders(origin),
      }
    );
  } catch (error) {
    console.error("GET Item", error);
    return errorResponse("GET Item Internal Error", 500, origin);
  }
}

export async function PUT(request, { params }) {
  const origin = request.headers.get("origin");

  const user = verifyJWT(request);

  if (!user) {
    return errorResponse("Unauthorized Request", 401, origin);
  }

  try {
    const { item_id } = await params;
    const data = await request.json();

    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME);

    const result = await db.collection("item").updateOne(
      {
        _id: new ObjectId(item_id),
        status: "ACTIVE",
      },
      {
        $set: {
          name: data.name,
          category: data.category,
          price: data.price,
          amount: data.amount,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return errorResponse("Item not found", 404, origin);
    }

    await db.collection("audit_log").insertOne({
      action: "UPDATE_ITEM",
      user: user.email,
      itemId: new ObjectId(item_id),
      timestamp: new Date(),
    });

    return NextResponse.json(
      { message: "Item updated successfully" },
      {
        status: 200,
        headers: getCorsHeaders(origin),
      }
    );
  } catch (error) {
    console.error("PUT Item", error);
    return errorResponse("PUT Item Internal Error", 500, origin);
  }
}

export async function DELETE(request, { params }) {
  const origin = request.headers.get("origin");

  const user = verifyJWT(request);

  if (!user) {
    return errorResponse("Unauthorized Request", 401, origin);
  }

  try {
    const { item_id } = await params;

    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME);

    const result = await db.collection("item").updateOne(
      {
        _id: new ObjectId(item_id),
        status: "ACTIVE",
      },
      {
        $set: {
          status: "DELETED",
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return errorResponse("Item not found", 404, origin);
    }

    await db.collection("audit_log").insertOne({
      action: "DELETE_ITEM",
      user: user.email,
      itemId: new ObjectId(item_id),
      timestamp: new Date(),
    });

    return NextResponse.json(
      { message: "Item deleted successfully" },
      {
        status: 200,
        headers: getCorsHeaders(origin),
      }
    );
  } catch (error) {
    console.error("DELETE Item", error);
    return errorResponse("DELETE Item Internal Error", 500, origin);
  }
}

export async function OPTIONS(request) {
  const origin = request.headers.get("origin");

  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}