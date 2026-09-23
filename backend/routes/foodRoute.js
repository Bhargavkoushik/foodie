import express from "express";
import { addFood, listFood, getFoodById, getFoodByRestaurant, removeFood } from "../controllers/foodController.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { protect, requireAdmin } from "../middlewares/authMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const foodRouter = express.Router();

// Image Storage Engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    return cb(null, `${Date.now()}_${file.originalname.replace(/\s+/g, "_")}`);
  },
});

const upload = multer({ storage: storage });

// Food endpoints
foodRouter.post("/add", protect, requireAdmin, upload.single("image"), addFood);
foodRouter.get("/list", listFood);
foodRouter.get("/restaurant/:restaurantId", getFoodByRestaurant);
foodRouter.get("/:id", getFoodById);
foodRouter.post("/remove", protect, requireAdmin, removeFood);
foodRouter.delete("/remove", protect, requireAdmin, removeFood);
foodRouter.delete("/:id", protect, requireAdmin, removeFood);

export default foodRouter;