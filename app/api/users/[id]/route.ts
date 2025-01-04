import { NextResponse } from "next/server";
import dbConnect from "../../../../utils/dbConnect";
import User from "../../../../models/User";

export async function GET(request: Request, { params }) {
  await dbConnect();
  const { id } = await params; // Await params before using its properties

  const user = await User.findById(id);
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}
