import dbConnect from "../../../src/utils/dbConnect";
import Post from "../../../src/models/Post";
import jwt from "jsonwebtoken";
import formidable from "formidable"; // Import formidable for file uploads
import fs from "fs"; // Import fs to handle file system operations

export const config = {
  api: {
    bodyParser: false, // Disable body parsing for file uploads
  },
};

export default async function handler(req, res) {
  await dbConnect();

  const { method } = req;

  switch (method) {
    case "GET":
      const posts = await Post.find()
        .populate("userId", "username") // Populates the username
        .sort({ createdAt: -1 });
      res.status(200).json(posts);
      break;
    case "POST":
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) return res.status(401).json({ message: "Unauthorized" });

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Use formidable to parse the form data
        const form = new formidable.IncomingForm();
        form.parse(req, async (err, fields, files) => {
          if (err) {
            return res.status(500).json({ message: "Error parsing the files" });
          }

          const { title, content } = fields;
          let image = null;

          // Handle image upload
          if (files.image) {
            const imagePath = `uploads/${files.image.name}`;
            fs.renameSync(files.image.path, imagePath); // Move the file to the uploads directory
            image = imagePath; // Set the image path
          }

          const newPost = new Post({
            userId: decoded.id,
            title,
            image,
            content,
          });
          await newPost.save();
          res.status(201).json(newPost);
        });
      } catch (error) {
        res.status(401).json({ message: "Invalid token" });
      }
      break;
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
