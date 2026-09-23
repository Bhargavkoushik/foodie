// foodController.js

import Food from "../models/foodModel.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "..", "uploads");

// Add food item
const addFood = async (req, res) => {
  try {
    const body = { ...req.body };

    const foodData = {
      name: body.name,
      price: Number(body.price),
      description: body.description,
      category: body.category,
      image: req.file?.filename || body.image || "",
    };

    if (body.restaurantId) {
      foodData.restaurantId = body.restaurantId;
    }

    const newFood = new Food(foodData);
    await newFood.save();

    res.status(201).json({ success: true, message: "Food added successfully", data: newFood, food: newFood });
  } catch (error) {
    console.error("❌ Add food error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// List all foods
const listFood = async (req, res) => {
  try {
    const foods = await Food.find({});
    res.status(200).json({ success: true, data: foods });
  } catch (error) {
    console.error("❌ List food error:", error);
    res.status(500).json({ success: false, message: "Error fetching food list" });
  }
};

// Get single food item by ID
const getFoodById = async (req, res) => {
  try {
    const { id } = req.params;
    const food = await Food.findById(id);
    if (!food) {
      return res.status(404).json({ success: false, message: "Food item not found" });
    }
    res.status(200).json({ success: true, data: food, food });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get food by restaurant
const getFoodByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const foodList = await Food.find({ restaurantId });
    res.status(200).json({ success: true, data: foodList, food: foodList });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove food item
const removeFood = async (req, res) => {
  try {
    const foodId = req.body?.id || req.body?._id || req.params?.id;
    if (!foodId) {
      return res.status(400).json({ success: false, message: "Food ID is required" });
    }

    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({ success: false, message: "Food item not found" });
    }

    if (food.image) {
      const imagePath = path.join(uploadsDir, food.image);
      fs.unlink(imagePath, (err) => {
        if (err && err.code !== "ENOENT") console.log("Failed to delete file:", err);
      });
    }

    await Food.findByIdAndDelete(foodId);
    res.json({ success: true, message: "Food item removed successfully" });
  } catch (error) {
    console.error("Remove food error:", error);
    res.status(500).json({ success: false, message: "Error removing food item" });
  }
};

// Export all
export { addFood, listFood, getFoodById, getFoodByRestaurant, removeFood };

