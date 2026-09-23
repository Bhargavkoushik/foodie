import Restaurant from "../models/restaurantModel.js";

export const addRestaurant = async (req, res) => {
  try {
    const { name, location, address, phone } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "Restaurant name is required" });
    }
    const restaurant = new Restaurant({
      name,
      location: location || address || "",
      address: address || location || "",
      phone: phone || "",
    });
    await restaurant.save();
    res.status(201).json({ success: true, message: "Restaurant added successfully", restaurant, data: restaurant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({});
    res.status(200).json({ success: true, data: restaurants, restaurants });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: "Restaurant not found" });
    }
    res.status(200).json({ success: true, data: restaurant, restaurant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

