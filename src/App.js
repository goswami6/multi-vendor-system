import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage"; // <-- import
import DashboardPage from "./pages/DashboardPage";
import ProductManagementPage from "./pages/ProductManagementPage";
import OrderPlacementPage from "./pages/OrderPlacementPage";
import AnalyticsPage from "./pages/AnalyticsPage";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} /> {/* <-- new route */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/products" element={<ProductManagementPage />} />
        <Route path="/order" element={<OrderPlacementPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
      </Routes>
    </Router>
  );
};

export default App;
