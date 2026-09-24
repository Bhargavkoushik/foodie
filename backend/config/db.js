import mongoose from "mongoose";

// Register connection lifecycle listeners once
mongoose.connection.on("connected", () => {
  console.log(`[MongoDB] Connected to database: ${mongoose.connection.name}`);
});

mongoose.connection.on("error", (err) => {
  console.error("[MongoDB] Connection runtime error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.warn("[MongoDB] Connection disconnected");
});

export const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    throw new Error("MONGODB_URI environment variable is not configured");
  }

  if (mongoURI.includes("<db_password>")) {
    throw new Error(
      "MONGODB_URI still contains '<db_password>'. Replace it with the actual database password."
    );
  }

  // Parse sanitized host for logging without exposing credentials
  let sanitizedHost = "MongoDB Cluster";
  try {
    const match = mongoURI.match(/^mongodb(?:\+srv)?:\/\/[^:]+:[^@]+@([^/?]+)/);
    if (match) {
      sanitizedHost = match[1];
    }
  } catch (e) {
    // ignore parse error
  }

  try {
    console.log(`[MongoDB] Connecting to ${sanitizedHost}...`);
    await mongoose.connect(mongoURI, {
      dbName: "foodie",
      serverSelectionTimeoutMS: 10000,
    });

    if (mongoose.connection.readyState !== 1) {
      throw new Error(`MongoDB connection readyState is ${mongoose.connection.readyState} (expected 1).`);
    }

    console.log(`[MongoDB] Connection successfully verified (readyState: ${mongoose.connection.readyState})`);
    console.log(`[MongoDB] Active Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB] Connection failed: ${error.message}`);
    throw error;
  }
};