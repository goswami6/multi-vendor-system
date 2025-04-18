import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const DashboardPage = () => {
  const [userData, setUserData] = useState(null);
  const [products, setProducts] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const userResponse = await axios.get("http://localhost:5000/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(userResponse.data);

        const productResponse = await axios.get("http://localhost:5000/api/products", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProducts(productResponse.data);

        if (userResponse.data.role === "admin") {
          const analyticsResponse = await axios.get("http://localhost:5000/api/users/stats", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setAnalytics(analyticsResponse.data);
        }

      } catch (error) {
        console.error("Error fetching data:", error);
        if (error.response?.status === 401) {
          navigate("/login");
        }
      }
    };

    fetchData();
  }, [token, navigate]);

  const handleLogout = () => {
    // Remove token from localStorage
    localStorage.removeItem("token");
    // Redirect to login page
    navigate("/login");
  };

  if (!userData) return <div className="text-center mt-10 text-lg">Loading...</div>;

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          Welcome, {userData.username}
        </h2>
        <p className="text-center text-lg mb-6">Role: {userData.role}</p>

        {/* Logout Button */}
        <div className="text-center mb-6">
          <button
            className="bg-red-500 text-white py-3 px-6 rounded hover:bg-red-600 transition duration-200"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          {userData.role === "user" && (
            <button
              className="bg-blue-500 text-white py-3 px-6 rounded hover:bg-blue-600 transition duration-200"
              onClick={() => navigate("/order")}
            >
              Place Order
            </button>
          )}
          {userData.role === "vendor" && (
            <button
              className="bg-green-500 text-white py-3 px-6 rounded hover:bg-green-600 transition duration-200"
              onClick={() => navigate("/products")}
            >
              Manage Products
            </button>
          )}
          {userData.role === "admin" && (
            <button
              className="bg-yellow-500 text-white py-3 px-6 rounded hover:bg-yellow-600 transition duration-200"
              onClick={() => navigate("/analytics")}
            >
              View Analytics
            </button>
          )}
        </div>

        {/* Conditional Rendering for User/Products */}
        {userData.role === "user" && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Available Products</h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="bg-gray-50 p-4 border rounded-lg shadow hover:shadow-md transition"
                >
                  <h4 className="font-medium text-lg">{product.name}</h4>
                  <p className="text-sm text-gray-600">Price: ₹{product.price}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conditional Rendering for Vendor/Product Management */}
        {userData.role === "vendor" && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Manage Your Products</h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {products.map((product) => (
                <div key={product._id} className="bg-gray-50 p-4 border rounded-lg shadow hover:shadow-md transition">
                  <h4 className="font-medium text-lg">{product.name}</h4>
                  <p className="text-sm text-gray-600">Price: ₹{product.price}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conditional Rendering for Admin/Analytics */}
        {userData.role === "admin" && (
          <div>
            <h3 className="text-xl font-semibold mb-4">User Analytics</h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {analytics.map((data) => (
                <div key={data._id} className="bg-gray-50 p-4 border rounded-lg shadow hover:shadow-md transition">
                  <h4 className="font-medium text-lg">Month: {data._id}</h4>
                  <p className="text-sm text-gray-600">Total Users: {data.total}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
