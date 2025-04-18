import React, { useState, useEffect } from "react";
import axios from "axios";

const OrderPlacementPage = () => {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [address, setAddress] = useState({ street: "", city: "", zip: "" });
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/products");
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  const handleProductChange = (product, checked) => {
    if (checked) {
      setSelectedProducts((prev) => [...prev, { productId: product._id, quantity: 1 }]);
    } else {
      setSelectedProducts((prev) => prev.filter((p) => p.productId !== product._id));
    }
  };

  const handleQuantityChange = (productId, quantity) => {
    setSelectedProducts((prev) =>
      prev.map((p) =>
        p.productId === productId ? { ...p, quantity: parseInt(quantity) } : p
      )
    );
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((total, item) => {
      const product = products.find((p) => p._id === item.productId);
      return total + (product?.price || 0) * item.quantity;
    }, 0);
  };

  const handlePlaceOrder = async () => {
    const orderData = {
      userId,
      vendorId: "yourVendorIdHere", // Replace this with a real value if needed
      items: selectedProducts,
      address,
      totalPrice: calculateTotal(),
      amount: calculateTotal(),
    };

    try {
      await axios.post("http://localhost:5000/api/orders", orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Order placed successfully!");
    } catch (error) {
      console.error("Error placing order:", error.response?.data || error.message);
      alert("Failed to place order. See console for more info.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-center">Place Your Order</h2>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4">Select Products</h3>
        {products.map((product) => (
          <div key={product._id} className="flex items-center mb-3">
            <input
              type="checkbox"
              onChange={(e) => handleProductChange(product, e.target.checked)}
              className="mr-2"
            />
            <span className="flex-1">
              {product.title} - ₹{product.price}
            </span>
            {selectedProducts.find((p) => p.productId === product._id) && (
              <input
                type="number"
                min="1"
                value={
                  selectedProducts.find((p) => p.productId === product._id)?.quantity || 1
                }
                onChange={(e) => handleQuantityChange(product._id, e.target.value)}
                className="border rounded px-2 py-1 w-20 ml-4"
              />
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4">Shipping Address</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Street"
            value={address.street}
            onChange={(e) => setAddress({ ...address, street: e.target.value })}
            className="border rounded px-4 py-2"
          />
          <input
            type="text"
            placeholder="City"
            value={address.city}
            onChange={(e) => setAddress({ ...address, city: e.target.value })}
            className="border rounded px-4 py-2"
          />
          <input
            type="text"
            placeholder="Zip"
            value={address.zip}
            onChange={(e) => setAddress({ ...address, zip: e.target.value })}
            className="border rounded px-4 py-2"
          />
        </div>
      </div>

      <div className="text-right mb-6">
        <p className="text-lg font-semibold">Total: ₹{calculateTotal()}</p>
      </div>

      <div className="text-center">
        <button
          onClick={handlePlaceOrder}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-lg"
        >
          Place Order
        </button>
      </div>
    </div>
  );
};

export default OrderPlacementPage;
