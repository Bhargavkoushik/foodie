import express from "express";
import { addRestaurant, getRestaurants, getRestaurantById } from "../controllers/restaurantController.js";
import { protect, requireAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getRestaurants);
router.get("/list", getRestaurants);
router.get("/:id", getRestaurantById);
router.post("/add", protect, requireAdmin, addRestaurant);

export default router;

