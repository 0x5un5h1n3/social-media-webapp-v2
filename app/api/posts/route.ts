import { NextResponse } from "next/server";
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
    };

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

    // Populate the userId field
    await newPost.populate("userId", "username");

    return NextResponse.json(newPost, { status: 201 });
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

  const token = request.headers.get("Authorization")?.split(" ")[1];
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
    };
    const { fields, files } = await parseMultipartFormData(request);

    const postToUpdate = await Post.findById(id);

    if (!postToUpdate) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    // Check if the user is the owner of the post
    if (postToUpdate.userId.toString() !== decoded.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    // Update post details
    postToUpdate.title = fields.title || postToUpdate.title;
    postToUpdate.content = fields.content || postToUpdate.content;
    postToUpdate.edited = true;
    postToUpdate.editedAt = new Date();

    // Handle image upload
    if (files.image) {
      postToUpdate.image = await saveUploadedFile(files.image);
    }

    await postToUpdate.save();
    await postToUpdate.populate("userId", "username");

    return NextResponse.json(postToUpdate);
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }
}

export async function PATCH(request: Request) {
  await dbConnect();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  const token = request.headers.get("Authorization")?.split(" ")[1];
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
    };
    const { userId } = await request.json();

    const postToLike = await Post.findById(id);
    if (!postToLike) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    // Check if the user has already liked the post
    const userIdString = userId.toString(); // Consistent type comparison

    const isLiked = postToLike.likes.some(
      (likedUserId) => likedUserId.toString() === userIdString
    );

    if (isLiked) {
      // Remove like
      postToLike.likes = postToLike.likes.filter(
        (likedUserId) => likedUserId.toString() !== userIdString
      );
    } else {
      // Add like
      postToLike.likes.push(userId);
    }

    await postToLike.save();
    await postToLike.populate("userId", "username");

    return NextResponse.json(postToLike);
  } catch (error) {
    console.error("Error liking post:", error);
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }
}

export async function DELETE(request: Request) {
  await dbConnect();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  const token = request.headers.get("Authorization")?.split(" ")[1];
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
    };

    // Use findOneAndDelete instead of remove
    const postToDelete = await Post.findOneAndDelete({
      _id: id,
      userId: decoded.id,
    });

    if (!postToDelete) {
      return NextResponse.json(
        { message: "Post not found or unauthorized" },
        { status: 404 }
      );
    }

    // Delete associated image file
    if (postToDelete.image) {
      const imagePath = path.join(process.cwd(), "public", postToDelete.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    return NextResponse.json(
      { message: "Post deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      {
        message: "Error deleting post",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
