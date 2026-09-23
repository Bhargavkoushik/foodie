// import React, { useContext } from "react";
// import "./PlaceOrder.css";
// import { StoreContext } from "../../components/context/StoreContext";
// const PlaceOrder = () => {
//     const {getTotalCartAmount} = useContext(StoreContext)
//   return (
//     <form className="place-order">
//       <div className="place-order-left">
//         <p className="title">Delivery Information</p>
//         <div className="multi-fields">
//           <input placeholder="First Name" type="text" />
//           <input placeholder="Last Name" type="text" />
//         </div>
//         <input placeholder="Email Adress" type="email" />
//         <input placeholder="Street" type="text" />
//         <div className="multi-fields">
//           <input placeholder="City" type="text" />
//           <input placeholder="State" type="text" />
//         </div>
//         <div className="multi-fields">
//           <input placeholder="Zip Code" type="text" />
//           <input placeholder="Country" type="text" />
//         </div>
//         <input type="text" placeholder="Phone" />
//       </div>
//       <div className="place-order-right">
//         <div className="cart-total">
//           <h2>Cart Totals</h2>
//           <div className="cart-total-details">
//             <p>Subtotal</p>
//             <p>${getTotalCartAmount()}</p>
//           </div>
//           <hr />
//           <div className="cart-total-details">
//             <p>Delivery Fee</p>
//             <p>${getTotalCartAmount() === 0? 0 : 2}</p>
//           </div>
//           <hr />
//           <div className="cart-total-details">
//             <b>
//               <p>Total</p>
//             </b>
//             <b>
//               <p>${getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 2}</p>
//             </b>
//           </div>
//           <button>
//             PROCEED TO PAYMENT
//           </button>
//         </div>
//       </div>
//     </form>
//   );
// };

// export default PlaceOrder;



import React, { useContext, useState } from "react";
import "./PlaceOrder.css";
import { StoreContext } from "../../components/context/StoreContext";
import Location from "./Location"; // Import the Location component
import { useNavigate } from "react-router-dom";
import apiRequest from "../../lib/apiRequest";
import toast from "react-hot-toast";

const PlaceOrder = () => {
    const { getTotalCartAmount, cartItems, food_list, clearCart } = useContext(StoreContext);
    const navigate = useNavigate();
    const [showLocationPopup, setShowLocationPopup] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [saveAddressForFuture, setSaveAddressForFuture] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        phone: ''
    });

    useEffect(() => {
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            const storageKey = user?.email ? `foodie_addresses_${user.email}` : "foodie_addresses_guest";
            const stored = JSON.parse(localStorage.getItem(storageKey)) || [];
            setSavedAddresses(stored);

            const defaultAddr = stored.find(a => a.isDefault) || stored[0];
            if (defaultAddr) {
                setFormData(prev => ({
                    ...prev,
                    firstName: defaultAddr.firstName || prev.firstName,
                    lastName: defaultAddr.lastName || prev.lastName,
                    email: defaultAddr.email || prev.email,
                    street: defaultAddr.street || prev.street,
                    city: defaultAddr.city || prev.city,
                    state: defaultAddr.state || prev.state,
                    zipCode: defaultAddr.zipCode || prev.zipCode,
                    country: defaultAddr.country || prev.country,
                    phone: defaultAddr.phone || prev.phone
                }));
            }
        } catch (e) {
            console.error(e);
        }
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleLocationSelect = (locationData) => {
        setFormData(prev => ({
            ...prev,
            street: locationData.street,
            city: locationData.city,
            state: locationData.state,
            zipCode: locationData.zipCode,
            country: locationData.country
        }));
        setShowLocationPopup(false);
    };

    const handleCloseLocationPopup = () => {
        setShowLocationPopup(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Build list of items currently in the cart
        const orderItems = [];
        food_list.forEach((item) => {
            if (cartItems[item._id] > 0) {
                orderItems.push({
                    foodId: item._id,
                    name: item.name,
                    price: item.price,
                    quantity: cartItems[item._id],
                    image: item.image,
                    restaurantId: item.restaurantId || null
                });
            }
        });

        if (orderItems.length === 0) {
            toast.error("Your cart is empty!");
            return;
        }

        const subtotal = getTotalCartAmount();
        const deliveryFee = subtotal === 0 ? 0 : 2;
        const totalAmount = subtotal + deliveryFee;

        const orderPayload = {
            items: orderItems,
            totalAmount,
            address: formData
        };

        try {
            setIsSubmitting(true);
            const token = localStorage.getItem("authToken");
            const headers = {};
            if (token && token !== "authenticated") {
                headers.Authorization = `Bearer ${token}`;
            }

            const response = await apiRequest.post("/api/order/place", orderPayload, { headers });

            if (response.data.success) {
                if (saveAddressForFuture && formData.street && formData.city) {
                    try {
                        const user = JSON.parse(localStorage.getItem("user"));
                        const storageKey = user?.email ? `foodie_addresses_${user.email}` : "foodie_addresses_guest";
                        const current = JSON.parse(localStorage.getItem(storageKey)) || [];
                        const exists = current.some(a => a.street === formData.street && a.city === formData.city);
                        if (!exists) {
                            current.push({ ...formData, tag: "Delivery", id: Date.now().toString() });
                            localStorage.setItem(storageKey, JSON.stringify(current));
                        }
                    } catch (e) {
                        console.error(e);
                    }
                }

                toast.success("Order placed successfully!");
                if (clearCart) clearCart();
                navigate("/orders/me");
            } else {
                toast.error(response.data.message || "Failed to place order.");
            }
        } catch (error) {
            console.error("Order error:", error);
            const errMsg = error.response?.data?.message || "Failed to place order.";
            toast.error(errMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <form className="place-order" onSubmit={handleSubmit}>
                <div className="place-order-left">
                    <p className="title">Delivery Information</p>

                    {savedAddresses.length > 0 && (
                        <div style={{ marginBottom: "15px" }}>
                            <label style={{ fontSize: "13px", fontWeight: "600", color: "#555", display: "block", marginBottom: "6px" }}>
                                📍 Choose from Saved Addresses:
                            </label>
                            <select
                                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "14px", backgroundColor: "#fff" }}
                                onChange={(e) => {
                                    const selected = savedAddresses.find(a => a.id === e.target.value);
                                    if (selected) {
                                        setFormData(prev => ({
                                            ...prev,
                                            firstName: selected.firstName || "",
                                            lastName: selected.lastName || "",
                                            email: selected.email || "",
                                            street: selected.street || "",
                                            city: selected.city || "",
                                            state: selected.state || "",
                                            zipCode: selected.zipCode || "",
                                            country: selected.country || "",
                                            phone: selected.phone || ""
                                        }));
                                        toast.success(`Loaded: ${selected.tag || "Address"}`);
                                    }
                                }}
                                defaultValue=""
                            >
                                <option value="" disabled>-- Select a saved delivery address --</option>
                                {savedAddresses.map((addr) => (
                                    <option key={addr.id} value={addr.id}>
                                        {addr.tag ? `[${addr.tag}] ` : ""}{addr.street}, {addr.city} ({addr.firstName} {addr.lastName})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    
                    <div className="multi-fields">
                        <input 
                            name="firstName"
                            placeholder="First Name" 
                            type="text" 
                            value={formData.firstName}
                            onChange={handleInputChange}
                        />
                        <input 
                            name="lastName"
                            placeholder="Last Name" 
                            type="text" 
                            value={formData.lastName}
                            onChange={handleInputChange}
                        />
                    </div>
                    <input 
                        name="email"
                        placeholder="Email Address" 
                        type="email" 
                        value={formData.email}
                        onChange={handleInputChange}
                    />
                    <input 
                        name="street"
                        placeholder="Street" 
                        type="text" 
                        value={formData.street}
                        onChange={handleInputChange}
                    />
                    <div className="multi-fields">
                        <input 
                            name="city"
                            placeholder="City" 
                            type="text" 
                            value={formData.city}
                            onChange={handleInputChange}
                        />
                        <input 
                            name="state"
                            placeholder="State" 
                            type="text" 
                            value={formData.state}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="multi-fields">
                        <input 
                            name="zipCode"
                            placeholder="Zip Code" 
                            type="text" 
                            value={formData.zipCode}
                            onChange={handleInputChange}
                        />
                        <input 
                            name="country"
                            placeholder="Country" 
                            type="text" 
                            value={formData.country}
                            onChange={handleInputChange}
                        />
                    </div>
                    <input 
                        name="phone"
                        type="text" 
                        placeholder="Phone" 
                        value={formData.phone}
                        onChange={handleInputChange}
                    />

                    <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "10px 0" }}>
                        <input
                            type="checkbox"
                            id="saveAddressCheckbox"
                            checked={saveAddressForFuture}
                            onChange={(e) => setSaveAddressForFuture(e.target.checked)}
                            style={{ width: "auto", cursor: "pointer" }}
                        />
                        <label htmlFor="saveAddressCheckbox" style={{ fontSize: "13px", cursor: "pointer", color: "#555" }}>
                            Save this address to my saved addresses
                        </label>
                    </div>

                    {/* Location Button */}
                    <button 
                        type="button" 
                        className="select-location-btn"
                        onClick={() => setShowLocationPopup(true)}
                    >
                         Select Current Location
                    </button>
                </div>


                 



                <div className="place-order-right">
                    <div className="cart-total">
                        <h2>Cart Totals</h2>
                        <div className="cart-total-details">
                            <p>Subtotal</p>
                            <p>${getTotalCartAmount()}</p>
                        </div>
                        <hr />
                        <div className="cart-total-details">
                            <p>Delivery Fee</p>
                            <p>${getTotalCartAmount() === 0 ? 0 : 2}</p>
                        </div>
                        <hr />
                        <div className="cart-total-details">
                            <b>
                                <p>Total</p>
                            </b>
                            <b>
                                <p>${getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 2}</p>
                            </b>
                        </div>
                        <button type="submit">
                            PROCEED TO PAYMENT
                        </button>
                    </div>
                </div>
            </form>

            {/* Location Popup */}
            {showLocationPopup && (
                <Location 
                    onLocationSelect={handleLocationSelect}
                    onClose={handleCloseLocationPopup}
                />
            )}
        </>
    );
};

export default PlaceOrder;