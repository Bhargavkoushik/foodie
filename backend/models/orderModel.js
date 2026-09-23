import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      foodId: { type: mongoose.Schema.Types.Mixed, required: true },
      name: { type: String },
      price: { type: Number },
      quantity: { type: Number, required: true },
      image: { type: String },
      restaurantId: { type: mongoose.Schema.Types.Mixed, required: false }
    }
  ],
  totalAmount: { type: Number, required: true },
  address: { type: Object, default: {} },
  status: { type: String, default: "Food Processing" },
  createdAt: { type: Date, default: Date.now }
});
export default mongoose.models.Order || mongoose.model("Order", orderSchema);
