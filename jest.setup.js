const dotenv = require("dotenv");
const path = require("path");
const axios = require("axios");
const mongoose = require("mongoose");

// Load environment variables from .env.local file only if MONGODB_URI is not already set
if (!process.env.MONGODB_URI) {
  dotenv.config({
    path: path.resolve(process.cwd(), ".env.local"),
  });
}

// Import dbConnect
const dbConnect = require("./utils/dbConnect").default;

// Log the MongoDB URI for debugging
console.log("Test Environment Initialized");
console.log("MongoDB URI:", process.env.MONGODB_URI);

// Set the base URL for Axios
axios.defaults.baseURL = process.env.BASE_URL || "http://localhost:3000";

// Global setup before all tests
beforeAll(async () => {
  try {
    // Ensure test environment
    process.env.NODE_ENV = "test";

    // Log the MongoDB URI before connecting
    console.log("MongoDB URI before connecting:", process.env.MONGODB_URI);

    // Connect to database
    await dbConnect();
    console.log("Database connected for testing");
  } catch (error) {
    console.error("Test setup failed:", error);
    throw error;
  }
});

// Global cleanup after all tests
afterAll(async () => {
  try {
    console.log("Closing database connection...");
    await mongoose.connection.close();
    console.log("Database connection closed.");
  } catch (error) {
    console.error("Test cleanup failed:", error);
  }
}, 60000); // Increase timeout to 60 seconds
