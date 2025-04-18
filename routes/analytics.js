// routes/analytics.js
const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const { verifyTokenAndAdmin } = require("../middlewares/verifyToken");

// Get Revenue Per Vendor (last 30 days)
router.get("/revenue-per-vendor", verifyTokenAndAdmin, async (req, res) => {
  try {
    const revenue = await Order.aggregate([
      {
        $match: { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }
      },
      {
        $group: {
          _id: "$vendorId", // Group by vendorId
          totalRevenue: { $sum: "$totalPrice" } // Calculate total revenue for each vendor
        }
      },
      {
        $lookup: {
          from: "users", // Assuming user details are stored in a collection called "users"
          localField: "_id",
          foreignField: "_id",
          as: "vendorDetails"
        }
      },
      {
        $unwind: "$vendorDetails"
      },
      {
        $project: {
          vendorName: "$vendorDetails.username",
          totalRevenue: 1
        }
      }
    ]);
    res.status(200).json(revenue);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get Top 5 Products by Sales (last 30 days)
router.get("/top-products", verifyTokenAndAdmin, async (req, res) => {
  try {
    const topProducts = await Order.aggregate([
      {
        $match: { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }
      },
      {
        $unwind: "$items" // Assuming "items" is an array in the order with product information
      },
      {
        $group: {
          _id: "$items.productId", // Group by productId
          totalSold: { $sum: "$items.quantity" }
        }
      },
      {
        $lookup: {
          from: "products", // Assuming products are stored in a collection called "products"
          localField: "_id",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      {
        $unwind: "$productDetails"
      },
      {
        $sort: { totalSold: -1 } // Sort by highest sales
      },
      {
        $limit: 5 // Limit to top 5 products
      },
      {
        $project: {
          productName: "$productDetails.title",
          totalSold: 1
        }
      }
    ]);
    res.status(200).json(topProducts);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get Average Order Value (last 30 days)
router.get("/avg-order-value", verifyTokenAndAdmin, async (req, res) => {
  try {
    const avgOrderValue = await Order.aggregate([
      {
        $match: { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }
      },
      {
        $group: {
          _id: null,
          average: { $avg: "$totalPrice" }
        }
      }
    ]);
    res.status(200).json(avgOrderValue);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
