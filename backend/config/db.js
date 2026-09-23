import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI;

        if (!mongoURI) {
            throw new Error("MONGODB_URI environment variable is not configured");
        }

        if (mongoURI.includes("<db_password>")) {
            throw new Error(
                "MONGODB_URI still contains <db_password>. Replace it with the actual database password."
            );
        }

        await mongoose.connect(mongoURI, {
            dbName: "foodie",
            serverSelectionTimeoutMS: 10000
        });

        console.log("MongoDB connected successfully");
        console.log(`Database: ${mongoose.connection.name}`);

    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        throw error;
    }
};