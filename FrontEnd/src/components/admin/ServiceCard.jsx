// src/components/admin/ServiceCard.jsx
import React, { useEffect, useState } from "react";
import { getTopServices } from "../../services/api";
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from "recharts";

const COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#3B82F6"];

const ServiceCard = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await getTopServices();
        setData(res);
      } catch (err) {
        console.error("Error fetching top services:", err);
      }
    };
    fetchServices();
  }, []);

  return (
    <div className="bg-white p-5 rounded-2xl shadow">
      <h3 className="text-lg font-semibold mb-4 text-gray-700">Top Services</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie data={data} dataKey="bookingCount" nameKey="serviceName" outerRadius={100}>
            {data.map((entry, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ServiceCard;
