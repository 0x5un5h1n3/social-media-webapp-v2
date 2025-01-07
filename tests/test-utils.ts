import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

export const getTestMongoURI = () => {
  return (
    process.env.MONGODB_URI ||
    "mongodb://localhost:27017/social_media_webapp_v2_test"
  );
};
