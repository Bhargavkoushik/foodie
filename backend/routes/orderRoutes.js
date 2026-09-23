import express from "express";
import { placeOrder, getOrders, getAllOrders, updateOrderStatus, deleteOrder } from "../controllers/orderController.js";
import { protect, requireAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/place", protect, placeOrder);
router.get("/", protect, getOrders);
router.get("/myorders", protect, getOrders);
router.get("/all", protect, requireAdmin, getAllOrders);
router.post("/status", protect, requireAdmin, updateOrderStatus);
router.put("/status", protect, requireAdmin, updateOrderStatus);
router.post("/delete", protect, requireAdmin, deleteOrder);
router.delete("/delete", protect, requireAdmin, deleteOrder);
router.delete("/:orderId", protect, requireAdmin, deleteOrder);

export default router;