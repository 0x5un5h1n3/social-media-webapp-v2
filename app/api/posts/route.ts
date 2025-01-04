import { NextResponse } from "next/server";
import dbConnect from "../../../utils/dbConnect";
import Post from "../../../models/Post";
import jwt from "jsonwebtoken";

export async function GET() {
  await dbConnect();
  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .populate("userId", "username"); // Populate username from userId
  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  await dbConnect();

  // Extract the token from the request headers
  const token = request.headers.get("Authorization")?.split(" ")[1];
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Verify the token and extract the user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { title, content } = await request.json();

    // Create a new post with the userId
    const newPost = new Post({ userId: decoded.id, title, content });
    await newPost.save();

    return NextResponse.json(newPost);
  } catch (error) {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }
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
