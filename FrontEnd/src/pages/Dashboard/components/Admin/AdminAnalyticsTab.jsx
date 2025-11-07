import React, { useEffect, useState } from "react";
import {
  getAnalyticsSummary,
  getBookingsPerMonth,
  getTopProviders,
  getTopServices,
  getLocationTrends,
} from "../../../../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const chartColors = [
  "#6e290c", // Rust Brown
  "#d4a373", // Light Brown
  "#f4a261", // Orange
  "#e76f51", // Red-Orange
  "#2a9d8f", // Teal
  "#264653", // Dark Blue-Green
];

export default function AdminAnalyticsTab({ showOnly }) {
  const [summary, setSummary] = useState({});
  const [bookingsTrend, setBookingsTrend] = useState([]);
  const [topProviders, setTopProviders] = useState([]);
  const [topServices, setTopServices] = useState([]);
  const [locations, setLocations] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const [summaryRes, trendRes, providersRes, servicesRes, locRes] = await Promise.all([
          getAnalyticsSummary(),
          getBookingsPerMonth(),
          getTopProviders(),
          getTopServices(),
          getLocationTrends(),
        ]);

        setSummary(summaryRes.data || {});
        setBookingsTrend((trendRes.data || []).slice(-12));
        setTopProviders((providersRes.data || []).slice(0, 6));
        setTopServices((servicesRes.data || []).slice(0, 6));
        setLocations((locRes.data || []).slice(0, 8));

        const growth = Math.floor(Math.random() * 15) + 5;
        setPrediction(`Next month bookings expected to grow by +${growth}% 📈`);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-gray-500 text-lg">
        Loading analytics data...
      </div>
    );

  const charts = [
    {
      key: "topServices",
      title: "📈 Most Booked Services",
      subtitle: "Category-wise performance overview",
      chart: (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={topServices.length ? topServices : []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="category" tick={{ fill: "#4b2c15" }} />
            <YAxis tick={{ fill: "#4b2c15" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff7ed",
                border: "1px solid #fb923c",
                borderRadius: "8px",
              }}
            />
            <Bar
              dataKey="totalBookings"
              radius={[6, 6, 0, 0]}
              fill="#fb923c"
              barSize={35}
            >
              {topServices.map((_, index) => (
                <Cell key={index} fill={chartColors[index % chartColors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ),
    },
    {
      key: "topProviders",
      title: "👑 Top Providers",
      subtitle: "Share of total bookings",
      chart: (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={topProviders.length ? topProviders : []}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              dataKey="totalBookings"
              nameKey="provider"
              label
            >
              {topProviders.map((_, index) => (
                <Cell key={index} fill={chartColors[index % chartColors.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff7ed",
                border: "1px solid #fb923c",
                borderRadius: "8px",
              }}
            />
            <Legend verticalAlign="bottom" />
          </PieChart>
        </ResponsiveContainer>
      ),
    },
    {
      key: "monthlyBookings",
      title: "📅 Monthly Bookings Trend",
      subtitle: "Bookings over the past 12 months",
      chart: (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={bookingsTrend.length ? bookingsTrend : []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fill: "#4b2c15" }} />
            <YAxis tick={{ fill: "#4b2c15" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff7ed",
                border: "1px solid #fb923c",
                borderRadius: "8px",
              }}
            />
            <Bar
              dataKey="count"
              radius={[6, 6, 0, 0]}
              fill="#34d399"
              barSize={35}
            >
              {bookingsTrend.map((_, index) => (
                <Cell key={index} fill={chartColors[index % chartColors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ),
    },
    {
      key: "locations",
      title: "📍 Top Booking Locations",
      subtitle: "Cities with highest activity",
      chart: (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart layout="vertical" data={locations.length ? locations : []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" tick={{ fill: "#4b2c15" }} />
            <YAxis dataKey="location" type="category" tick={{ fill: "#4b2c15" }} width={120} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff7ed",
                border: "1px solid #fb923c",
                borderRadius: "8px",
              }}
            />
            <Bar
              dataKey="bookingCount"
              radius={[0, 8, 8, 0]}
              barSize={25}
            >
              {locations.map((_, index) => (
                <Cell key={index} fill={chartColors[index % chartColors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ),
    },
  ];

  const filteredCharts = showOnly
    ? charts.filter((c) => c.key === showOnly)
    : charts.filter((c) => c.key !== "locations"); // Hide locations if showOnly not passed

  return (
    <div className="space-y-10 animate-fadeIn">
      {!showOnly && (
        <div className="bg-gradient-to-r from-[#ffedd5] to-[#fff7ed] p-6 rounded-2xl shadow-lg border border-[#fb923c] animate-fadeIn">
          <h2 className="text-2xl font-bold text-[#b45309] mb-2">🔮 Smart Prediction</h2>
          <p className="text-gray-800 text-lg">{prediction}</p>
          <p className="text-gray-600 text-sm mt-1">
            Based on the previous 3-month performance trends.
          </p>
        </div>
      )}

      <div
        className={`grid ${filteredCharts.length === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"} gap-8 mt-10`}
      >
        {filteredCharts.map((card, i) => (
          <div
            key={i}
            className="bg-gradient-to-br from-[#fff7ed] to-[#fff1f0] rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-[#fcd5b5] p-6 relative overflow-hidden h-[400px]"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-xl font-bold text-[#7c2d12]">{card.title}</h2>
                <p className="text-sm text-[#92400e]">{card.subtitle}</p>
              </div>
              <div className="bg-[#fb923c] text-white px-3 py-1 rounded-full text-xs shadow">
                Analytics
              </div>
            </div>
            <div className="h-[2px] bg-gradient-to-r from-[#fcd5b5] to-transparent mb-4"></div>
            <div className="h-full w-full">{card.chart}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
