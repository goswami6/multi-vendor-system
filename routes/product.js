const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { verifyToken, verifyTokenAndVendor } = require("../middlewares/verifyToken");
const Joi = require("joi");

// Validation schema
const productSchema = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().required(),
  stock: Joi.number().min(0).required(),
  category: Joi.string().required(),
});

// CREATE product (Vendor only)
router.post("/", verifyTokenAndVendor, async (req, res) => {
  const { error } = productSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const newProduct = new Product({
      ...req.body,
      vendorId: req.user.id, // comes from decoded token
    });
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE product (Vendor only, owner)
router.put("/:id", verifyTokenAndVendor, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || product.vendorId.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized to update this product" });

    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE product (Vendor only, owner)
router.delete("/:id", verifyTokenAndVendor, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || product.vendorId.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized to delete this product" });

    await product.deleteOne();
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET ALL PRODUCTS (Public)
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET SINGLE PRODUCT (Public)
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
