import { createContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { food_list as staticFoodList } from "../../assets/frontend_assets/assets";
import apiRequest, { BASE_URL } from "../../lib/apiRequest";

export const StoreContext = createContext();

const StoreContextProvider = ({ children }) => {
  const [foodList, setFoodList] = useState(staticFoodList);
  const [cartItems, setCartItems] = useState({});
  const [wishlistItems, setWishlistItems] = useState({});
  // sortOrder: 'none' | 'asc' | 'desc'
  const [sortOrder, setSortOrder] = useState('none');

  // Fetch foods from backend API and combine with static items
  const fetchFoodList = async () => {
    try {
      const response = await apiRequest.get("/api/food/list");
      if (response.data.success && Array.isArray(response.data.data) && response.data.data.length > 0) {
        const backendFoods = response.data.data.map((item) => ({
          ...item,
          image: item.image?.startsWith("http") || !item.image
            ? item.image
            : `${BASE_URL}/images/${item.image}`,
        }));
        // Merge backend foods ahead of static items
        setFoodList([...backendFoods, ...staticFoodList]);
      }
    } catch (error) {
      console.log("Backend food list unavailable, using local assets:", error.message);
    }
  };

  useEffect(() => {
    fetchFoodList();
  }, []);

  /** Add an item to the cart or increment quantity (with max limit) */
  const addToCart = (itemId) => {
    setCartItems((prev) => {
      const currentQty = prev[itemId] || 0;
      if (currentQty >= 20) {
        toast.warning("You can only add up to 20 of this item.");
        return prev;
      }
      return {
        ...prev,
        [itemId]: currentQty + 1,
      };
    });
  };

  /** Clear all items from cart */
  const clearCart = () => {
    setCartItems({});
  };

  /** Remove an item from the cart or delete if quantity is 1 */
  const removeFromCart = (itemId) => {
    setCartItems((prev) => {
      if (!prev[itemId]) return prev;
      const updated = { ...prev };
      if (updated[itemId] > 1) updated[itemId] -= 1;
      else delete updated[itemId];
      return updated;
    });
    toast.error("Item removed from cart!");
  };

  /** Get total cart amount based on quantity & price */
  const getTotalCartAmount = () => {
    return Object.entries(cartItems).reduce((total, [itemId, qty]) => {
      const itemInfo = foodList.find((p) => p._id === itemId);
      return itemInfo ? total + itemInfo.price * qty : total;
    }, 0);
  };

  /** Add an item to wishlist */
  const addToWishlist = (itemId) => {
    if (!wishlistItems[itemId]) {
      setWishlistItems((prev) => ({ ...prev, [itemId]: true }));
      toast.info("Item added to wishlist!");
    }
  };

  /** Remove an item from wishlist */
  const removeFromWishlist = (itemId) => {
    if (wishlistItems[itemId]) {
      setWishlistItems((prev) => {
        const updated = { ...prev };
        delete updated[itemId];
        return updated;
      });
      toast.warn("Item removed from wishlist!");
    }
  };

  /** Toggle wishlist state for an item */
  const toggleWishlist = (itemId) => {
    isInWishlist(itemId) ? removeFromWishlist(itemId) : addToWishlist(itemId);
  };

  /** Check if item is in wishlist */
  const isInWishlist = (itemId) => !!wishlistItems[itemId];

  /** Total wishlist count */
  const getWishlistCount = () => Object.keys(wishlistItems).length;

  const contextValue = {
    food_list: foodList,
    sortOrder,
    setSortOrder,
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
    getTotalCartAmount,
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    getWishlistCount,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
