import mongoose from "mongoose";

const dbConnect = async () => {
  if (mongoose.connection.readyState >= 1) return;

  try {
    mongoose.set("debug", true); // Enable Mongoose debug mode
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    console.error("MongoDB URI:", process.env.MONGODB_URI);
    console.error("MongoDB connection error details:", error.message);
    throw new Error("Failed to connect to MongoDB");
  }
};

export default dbConnect;
