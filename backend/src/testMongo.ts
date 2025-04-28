import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI =
  process.env.MONGO_URI ||
  "mongodb://admin:password@localhost:27017/guild-site?authSource=admin";

async function testConnection() {
  try {
    console.log("Testing connection to:", MONGODB_URI);

    // Add connection event listeners
    mongoose.connection.on("connecting", () => {
      console.log("MongoDB connecting...");
    });

    mongoose.connection.on("connected", () => {
      console.log("MongoDB connected successfully");
    });

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
    });

    // Try to connect
    await mongoose.connect(MONGODB_URI);

    // Try a simple operation
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    console.log("Available collections:", collections);

    // Close the connection
    await mongoose.connection.close();
    console.log("Test completed");
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testConnection();
