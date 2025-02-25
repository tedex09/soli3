import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Request from "@/models/Request";
import { cacheGet, cacheSet } from "@/lib/redis";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.role === "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Try to get from cache
    const cacheKey = `admin:requests:${page}:${limit}`;
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    await dbConnect();
    
    const [requests, total] = await Promise.all([
      Request.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "name email"),
      Request.countDocuments()
    ]);

    const result = {
      items: requests,
      total,
      hasMore: skip + limit < total
    };

    // Cache for 5 minutes
    await cacheSet(cacheKey, result, 300);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching requests:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.role === "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    await Request.deleteMany({});

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}