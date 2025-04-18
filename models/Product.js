const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assuming vendors are also stored in the User collection
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt automatically
);

module.exports = mongoose.model("Product", productSchema);
