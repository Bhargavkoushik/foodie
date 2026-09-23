import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/foodie-app";
        if (mongoURI.includes("<db_password>")) {
            console.warn("\n⚠️  [MongoDB] Notice: MONGODB_URI contains '<db_password>'.");
            console.warn("👉 Please replace '<db_password>' with your actual database user password in backend/.env to connect to MongoDB Atlas.\n");
        }
        await mongoose.connect(mongoURI, {
            dbName: "foodie"
        });
        console.log('db connected');
    } catch (error) {
        console.log('Database connection failed, starting without DB:', error.message);
        // Continue without database for demo purposes
    }
};