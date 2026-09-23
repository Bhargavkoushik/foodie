import Order from "../models/orderModel.js";
import Cart from "../models/cartModel.js";

export const placeOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    let orderItems = [];
    let totalAmount = 0;

    // Check if items are sent directly in request body (e.g. from frontend cart)
    if (req.body.items && Array.isArray(req.body.items) && req.body.items.length > 0) {
      orderItems = req.body.items.map((item) => ({
        foodId: item.foodId || item._id,
        name: item.name,
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1,
        image: item.image || "",
        restaurantId: item.restaurantId || null
      }));

      totalAmount = Number(req.body.totalAmount) || orderItems.reduce(
        (sum, item) => sum + (item.price * item.quantity),
        0
      );
    } else {
      // Fallback: check database Cart collection
      const cart = await Cart.findOne({ userId });
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ success: false, message: "Cart is empty" });
      }

      orderItems = cart.items;
      totalAmount = Number(req.body.totalAmount) || 0;
    }

    const order = new Order({
      userId,
      items: orderItems,
      totalAmount,
      address: req.body.address || {},
      status: "Food Processing"
    });

    await order.save();

    // Clean up any database cart
    await Cart.findOneAndDelete({ userId });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
      data: order
    });
  } catch (error) {
    console.error("Order Placement Error:", error);
    res.status(500).json({ success: false, message: "Error placing order", error: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: orders, orders });
  } catch (error) {
    console.error("Fetch Orders Error:", error);
    res.status(500).json({ success: false, message: "Error fetching orders", error: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate("userId", "name email").sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: orders, orders });
  } catch (error) {
    console.error("Fetch All Orders Error:", error);
    res.status(500).json({ success: false, message: "Error fetching all orders", error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.body?.orderId || req.body?.id || req.params?.orderId || req.params?.id;
    const status = req.body?.status;
    if (!orderId || !status) {
      return res.status(400).json({ success: false, message: "orderId and status are required" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({
      success: true,
      message: "Status updated successfully",
      order: updatedOrder,
      data: updatedOrder
    });
  } catch (error) {
    console.error("Update Order Status Error:", error);
    res.status(500).json({ success: false, message: "Error updating status", error: error.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const orderId = req.body?.orderId || req.body?.id || req.params?.orderId || req.params?.id;
    if (!orderId) {
      return res.status(400).json({ success: false, message: "orderId is required" });
    }
    const deleted = await Order.findByIdAndDelete(orderId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.status(200).json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    console.error("Delete Order Error:", error);
    res.status(500).json({ success: false, message: "Error deleting order", error: error.message });
  }
};

