import mongoose from "mongoose";
import { configDotenv } from "dotenv";

// Load environment variables
configDotenv();

const mongo_uri = process.env.MONGO_URI;

if (!mongo_uri) {
  console.error("❌ Mongo URI is not defined in .env");
  process.exit(1);
}

const connectDB = async () => {
  try {
    // In Mongoose 6+, these options are default, so no need to set them
    await mongoose.connect(mongo_uri);

    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
