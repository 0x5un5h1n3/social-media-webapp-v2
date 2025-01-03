import dbConnect from "../../../utils/dbConnect";
import Post from "../../../models/Post";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  await dbConnect();

  const { method } = req;

  switch (method) {
    case "GET":
      const posts = await Post.find().sort({ createdAt: -1 });
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
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
