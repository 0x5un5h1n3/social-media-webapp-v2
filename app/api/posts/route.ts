import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../utils/dbConnect";
import Post from "../../../models/Post";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Function to parse multipart form data manually
async function parseMultipartFormData(request: Request) {
  const contentType = request.headers.get("content-type");
  if (!contentType || !contentType.includes("multipart/form-data")) {
    throw new Error("Not a multipart form data request");
  }

  const formData = await request.formData();
  const fields: Record<string, string> = {};
  const files: Record<string, File> = {};

  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      files[key] = value;
    } else {
      fields[key] = value.toString();
    }
  }

  return { fields, files };
}

// Function to save uploaded file
async function saveUploadedFile(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const filename = `post-${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
  const filepath = path.join(uploadsDir, filename);

  fs.writeFileSync(filepath, buffer);

  return `/uploads/${filename}`;
}

export async function GET() {
  await dbConnect();
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("userId", "username");
    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { message: "Error fetching posts" },
      { status: 500 }
    );
  }
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

    // Parse the form data
    const { fields, files } = await parseMultipartFormData(request);

    // Extract title and content from fields
    const title = fields.title;
    const content = fields.content;

    let image = null;
    // Handle image upload
    if (files.image) {
      image = await saveUploadedFile(files.image);
    }

    // Create a new post with the userId and image
    const newPost = new Post({
      userId: decoded.id,
      title,
      image,
      content,
    });
    await newPost.save();

    return NextResponse.json(newPost);
  } catch (error) {
    console.error("Post creation error:", error);
    return NextResponse.json(
      {
        message: "Invalid token or server error",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  await dbConnect();

  // Extract the query parameters from the request URL
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id"); // Get post ID from query parameters

  // Parse the request body
  const { userId } = await request.json(); // Get user ID from request body

  const postToUpdate = await Post.findById(id);

  if (!postToUpdate) {
    return NextResponse.json({ message: "Post not found" }, { status: 404 });
  }

  // Check if the user has already liked the post
  const userIdString = userId.toString(); // Consistent type comparison
  const isLiked = postToUpdate.likes.some(
    (likedUserId) => likedUserId.toString() === userIdString
  );

  if (isLiked) {
    // User has already liked the post, remove the like
    postToUpdate.likes = postToUpdate.likes.filter(
      (likedUserId) => likedUserId.toString() !== userIdString
    );
  } else {
    // User has not liked the post, add the like
    postToUpdate.likes.push(userId);
  }

  await postToUpdate.save();
  return NextResponse.json(postToUpdate);
}
