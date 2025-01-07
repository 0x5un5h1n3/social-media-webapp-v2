const dotenv = require("dotenv");
const path = require("path");
const axios = require("axios");

// Load .env.local file
dotenv.config({
  path: path.resolve(process.cwd(), ".env.local"),
});

// Add global test setup
console.log("Test Environment Initialized");
console.log("MongoDB URI:", process.env.MONGODB_URI);

// Set the base URL for Axios
axios.defaults.baseURL = process.env.BASE_URL || "http://localhost:3000";
