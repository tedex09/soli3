import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Request from "@/models/Request";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const request = await Request.findOne({
      _id: params.id,
      userId: session.user.id,
    });

    if (!request) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(request);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    await dbConnect();

    const request = await Request.findOneAndUpdate(
      { _id: params.id, userId: session.user.id },
      body,
      { new: true }
    );

    if (!request) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(request);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const request = await Request.findOneAndDelete({
      _id: params.id,
      userId: session.user.id,
    });

    if (!request) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}