import mongoose from "mongoose";
import { configDotenv } from "dotenv";
configDotenv()
const mongo_uri= process.env.MONGO_URI;
if (!mongo_uri){
    console.log("mongo uri is not defined");
    process.exit(1);
}
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

export default connectDB;