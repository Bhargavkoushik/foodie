import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../models/userModel.js";

const seedAdmin = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    const adminEmail = process.env.ADMIN_EMAIL || "admin@foodie.com";
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!mongoURI) {
      console.error("❌ MONGODB_URI environment variable is required.");
      process.exit(1);
    }

    if (!adminPassword) {
      console.error("❌ ADMIN_PASSWORD environment variable is required to seed the admin account.");
      console.error("   Please set ADMIN_PASSWORD in your backend/.env file.");
      process.exit(1);
    }

    if (adminPassword.length < 6) {
      console.error("❌ ADMIN_PASSWORD must be at least 6 characters long.");
      process.exit(1);
    }

    await mongoose.connect(mongoURI, { dbName: "foodie", serverSelectionTimeoutMS: 10000 });
    console.log("Connected to MongoDB for admin seeding");

    const existingAdmin = await User.findOne({ email: adminEmail });
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    if (existingAdmin) {
      existingAdmin.role = "admin";
      existingAdmin.password = hashedPassword;
      existingAdmin.name = "Foodie Administrator";
      await existingAdmin.save();
      console.log(`✅ Admin account updated successfully: ${adminEmail} (role: admin)`);
    } else {
      await User.create({
        name: "Foodie Administrator",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
      });
      console.log(`✅ Admin account created successfully: ${adminEmail} (role: admin)`);
    }

    await mongoose.disconnect();
    console.log("Database disconnected. Admin seed complete.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Admin seed failed:", error);
    process.exit(1);
  }
};

seedAdmin();

