import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String },
  likes: { type: [mongoose.Schema.Types.ObjectId], default: [] }, // Change to an array of user IDs
  createdAt: { type: Date, default: Date.now },
  edited: { type: Boolean, default: false }, // Track if the post has been edited
  editedAt: { type: Date }, // Track when the post was edited
});

export default mongoose.models.Post || mongoose.model("Post", PostSchema);
