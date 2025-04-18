import React, { useState, useEffect } from "react";
import axios from "axios";

const AnalyticsPage = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true); // Add a loading state
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/analytics", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAnalyticsData(response.data);
      } catch (error) {
        console.error("Error fetching analytics:", error);
        setError("Failed to fetch analytics data.");
      } finally {
        setLoading(false); // Set loading to false once data is fetched
      }
    };

    if (token) {
      fetchAnalytics();
    } else {
      setError("Unauthorized access. Please log in.");
      setLoading(false); // Stop loading if token is not available
    }
  }, [token]);

  // Show loading state or error message
  if (loading) {
    return <div>Loading analytics data...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  // Display analytics data once it's fetched
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Analytics</h2>
      <div>
        <p className="text-lg">Revenue: ${analyticsData.revenue}</p>
        <p className="text-lg">Top Products: {analyticsData.topProducts}</p>
        {/* Add other metrics or components as needed */}
      </div>
    </div>
  );
};

export default AnalyticsPage;
