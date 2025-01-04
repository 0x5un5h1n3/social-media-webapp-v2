import dbConnect from "../../../src/utils/dbConnect";
import Post from "../../../src/models/Post";
import User from "../../../src/models/User"; // Import User model
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  await dbConnect();

  const { method } = req;

  switch (method) {
    case "GET":
      const posts = await Post.find()
        .populate("userId", "username") // Populates the username
        .sort({ createdAt: -1 });
      console.log("Fetched posts:", posts); // Log the posts to see the structure
      res.status(200).json(posts);
      break;
    case "POST":
      const { title, content } = req.body;
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) return res.status(401).json({ message: "Unauthorized" });

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const newPost = new Post({ userId: decoded.id, title, content });
        await newPost.save();
        res.status(201).json(newPost);
      } catch (error) {
        res.status(401).json({ message: "Invalid token" });
      }
      break;
    case "PUT": // Handle liking a post
      const { id } = req.query; // Get post ID from query
      const { userId } = req.body; // Get user ID from request body
      const postToUpdate = await Post.findById(id);
      if (!postToUpdate)
        return res.status(404).json({ message: "Post not found" });

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
      res.status(200).json(postToUpdate);
      break;
    default:
      res.setHeader("Allow", ["GET", "POST", "PUT"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
