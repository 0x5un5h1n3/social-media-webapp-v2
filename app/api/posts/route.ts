import { NextResponse } from "next/server";
import dbConnect from "../../../utils/dbConnect";
import Post from "../../../models/Post";

export async function GET() {
  await dbConnect();
  const posts = await Post.find().sort({ createdAt: -1 });
  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  await dbConnect();
  const { title, content } = await request.json();
  const newPost = new Post({ title, content });
  await newPost.save();
  return NextResponse.json(newPost);
}
