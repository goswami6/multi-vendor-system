import React, { useState, useEffect } from "react";
import axios from "axios";

const ProductManagementPage = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/products", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to fetch products.");
      }
    };

    if (token) {
      fetchProducts();
    } else {
      setError("Unauthorized access, please log in.");
    }
  }, [token]);

  const handleAddProduct = async () => {
    // Basic form validation
    if (!newProduct.name || !newProduct.price || !newProduct.stock || !newProduct.category) {
      setError("All fields are required.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/products", newProduct, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts([...products, response.data]);
      setNewProduct({ name: "", price: "", stock: "", category: "" }); // Reset form
      setSuccess("Product added successfully!");
      setError(""); // Clear previous errors
    } catch (error) {
      console.error("Error adding product:", error);
      setError("Failed to add product.");
      setSuccess("");
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Product Management</h2>
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}

      <div className="mb-6">
        <input
          type="text"
          placeholder="Product Name"
          value={newProduct.name}
          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
          className="border p-2 mb-2 w-full"
        />
        <input
          type="number"
          placeholder="Price"
          value={newProduct.price}
          onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
          className="border p-2 mb-2 w-full"
        />
        <input
          type="number"
          placeholder="Stock"
          value={newProduct.stock}
          onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
          className="border p-2 mb-2 w-full"
        />
        <input
          type="text"
          placeholder="Category"
          value={newProduct.category}
          onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
          className="border p-2 mb-2 w-full"
        />
        <button
          onClick={handleAddProduct}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-4 w-full"
        >
          Add Product
        </button>
      </div>

      <div>
        <h3 className="text-xl font-semibold">Product List</h3>
        {products.length === 0 ? (
          <p>No products available.</p>
        ) : (
          products.map((product) => (
            <div key={product._id} className="border p-4 mb-4">
              <h4 className="text-lg font-bold">{product.name}</h4>
              <p>Price: ${product.price}</p>
              <p>Stock: {product.stock}</p>
              <p>Category: {product.category}</p>
              {/* Add buttons for editing or deleting products */}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductManagementPage;
