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

    // Safely handle error message
    const errorMessage = error instanceof Error ? error.message : String(error);

    console.error("MongoDB connection error details:", errorMessage);
    throw new Error(`Failed to connect to MongoDB: ${errorMessage}`);
  }
};

export default dbConnect;
