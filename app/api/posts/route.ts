import { NextResponse } from "next/server";
import dbConnect from "../../../utils/dbConnect";
import Post from "../../../models/Post";

export async function GET() {
  await dbConnect();
  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .populate("userId", "username");
  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  await dbConnect();
  const { title, content } = await request.json();
  const newPost = new Post({ title, content });
  await newPost.save();
  return NextResponse.json(newPost);
}

export async function PUT(request: Request) {
  await dbConnect();

  // Extract the query parameters from the request URL
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id"); // Get post ID from query parameters

  const { userId } = await request.json(); // Get user ID from request body
  const postToUpdate = await Post.findById(id);

  if (!postToUpdate) {
    return NextResponse.json({ message: "Post not found" }, { status: 404 });
  }

  // Check if the user has already liked the post
  if (postToUpdate.likes.includes(userId)) {
    // User has already liked the post, remove the like
    postToUpdate.likes = postToUpdate.likes.filter(
      (user) => user.toString() !== userId // Ensure toString for comparison
    );
  } else {
    // User has not liked the post, add the like
    postToUpdate.likes.push(userId);
  }

  await postToUpdate.save();
  return NextResponse.json(postToUpdate);
}
