const router = require("express").Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("../middlewares/verifyToken");

// CREATE ORDER (Only logged-in users)
router.post("/", verifyToken, async (req, res) => {
  const { userId, address, items } = req.body;

  // Ensure that the required fields are provided
  if (!userId || !address || !items || items.length === 0) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Split products by vendor
  const vendorOrders = {};
  let totalPrice = 0;

  // Group products by vendor
  for (let item of items) {
    const product = await Product.findById(item.productId);
    const vendorId = product.vendor; // Vendor ID associated with the product

    if (!vendorOrders[vendorId]) {
      vendorOrders[vendorId] = [];
    }

    vendorOrders[vendorId].push(item);
    totalPrice += product.price * item.quantity; // Calculate the total price of the order
  }

  try {
    const orders = [];
    for (let vendorId in vendorOrders) {
      // Create an order for each vendor
      const newOrder = new Order({
        userId,
        products: vendorOrders[vendorId].map(item => ({
          productId: item.productId,
          vendorId,
          quantity: item.quantity,
        })),
        amount: totalPrice, // You can choose to split the total amount among vendors or leave as is
        address,
        status: "pending", // Initial status as pending
      });

      const savedOrder = await newOrder.save();
      orders.push(savedOrder);
    }

    res.status(201).json({ message: "Order placed successfully", orders });
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ message: "Failed to create order", error: err.message });
  }
});

// UPDATE ORDER (Admin only)
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(updatedOrder);
  } catch (err) {
    console.error("Error updating order:", err);
    res.status(500).json({ message: "Failed to update order", error: err.message });
  }
});

// DELETE ORDER (Admin only)
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json("Order has been deleted");
  } catch (err) {
    console.error("Error deleting order:", err);
    res.status(500).json({ message: "Failed to delete order", error: err.message });
  }
});

// GET USER ORDERS (User or Admin)
router.get("/find/:userId", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId });
    if (!orders) {
      return res.status(404).json({ message: "No orders found for this user" });
    }
    res.status(200).json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ message: "Failed to get orders", error: err.message });
  }
});

// GET ALL ORDERS (Admin only)
router.get("/", verifyTokenAndAdmin, async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (err) {
    console.error("Error fetching all orders:", err);
    res.status(500).json({ message: "Failed to get all orders", error: err.message });
  }
});

module.exports = router;
