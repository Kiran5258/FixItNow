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
  LineChart,
  Line,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const chartColors = [
  "#6e290c",
  "#d4a373",
  "#f4a261",
  "#e76f51",
  "#2a9d8f",
  "#264653",
];

export default function AdminAnalyticsTab({ showOnly }) {
  const [summary, setSummary] = useState({});
  const [bookingsTrend, setBookingsTrend] = useState([]);
  const [topProviders, setTopProviders] = useState([]);
  const [topServices, setTopServices] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  const allMonths = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const fetchAnalytics = async () => {
    try {
      const [summaryRes, trendRes, providersRes, servicesRes, locRes] =
        await Promise.all([
          getAnalyticsSummary(),
          getBookingsPerMonth(),
          getTopProviders(),
          getTopServices(),
          getLocationTrends(),
        ]);
        console.log("📊 Raw Summary Response:", summaryRes.data);
console.log("👥 Top Providers Response:", providersRes.data);
console.log("🧍‍♂️ Top Services Response:", servicesRes.data);
console.log("📍 Location Trends Response:", locRes.data);


      const raw = summaryRes.data || {};

      // ✅ Normalize keys (handle multiple possible backend responses)
      const normalizedSummary = {
        totalBookings:
          raw.totalBookings ?? raw.bookings ?? raw.total ?? 0,
        activeProviders:
          raw.activeProviders ?? raw.providers ?? raw.activeProviderCount ?? 0,
        totalCustomers:
          raw.totalCustomers ?? raw.customers ?? raw.activeCustomers ?? 0,
        pendingProviders:
          raw.pendingProviders ?? raw.pending ?? raw.pendingCount ?? 0,
      };

      const trendData = trendRes.data || [];
      const fullTrend = allMonths.map((month) => {
        const found = trendData.find((t) => t.month === month);
        return { month, count: found ? found.count : 0 };
      });

      setSummary({
  totalBookings: raw.totalBookings ?? 0,
  completedBookings: raw.completedBookings ?? 0,
  totalProviders: raw.totalProviders ?? 0,
  totalUsers: raw.totalUsers ?? 0,
 
});
      setBookingsTrend(fullTrend);
      setTopProviders(providersRes.data || []);
      setTopServices(servicesRes.data || []);
      setLocations(locRes.data || []);
    } catch (err) {
      console.error("❌ Failed to fetch analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-gray-500 text-lg">
        Loading real-time analytics...
      </div>
    );

  // ✅ Summary KPI Cards
  // ✅ Summary KPI Cards
const summaryCards = [
  { label: "Total Bookings", value: summary.totalBookings || 0, color: "#6e290c" },
  { label: "Completed Bookings", value: summary.completedBookings || 0, color: "#2a9d8f" },
  { label: "Total Providers", value: summary.totalProviders || 0, color: "#d4a373" },
  { label: "Total Users", value: summary.totalUsers || 0, color: "#e76f51" },
 
];


  const downloadReport = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Admin Analytics Report", 14, 15);
    doc.setFontSize(11);

    doc.text("📋 Summary Overview", 14, 25);
    const summaryData = summaryCards.map((c) => [c.label, c.value]);
    autoTable(doc, { startY: 30, head: [["Metric", "Value"]], body: summaryData });

    let nextY = doc.lastAutoTable.finalY + 10;
    doc.text("📅 Monthly Bookings Trend", 14, nextY);
    nextY += 5;
    autoTable(doc, {
      startY: nextY,
      head: [["Month", "Bookings"]],
      body: bookingsTrend.map((b) => [b.month, b.count]),
    });

    nextY = doc.lastAutoTable.finalY + 10;
    doc.text("📈 Top Booked Services", 14, nextY);
    nextY += 5;
    autoTable(doc, {
      startY: nextY,
      head: [["Service Category", "Total Bookings"]],
      body: topServices.map((s) => [s.category, s.totalBookings]),
    });

    nextY = doc.lastAutoTable.finalY + 10;
    doc.text("👑 Top Providers", 14, nextY);
    nextY += 5;
    autoTable(doc, {
      startY: nextY,
      head: [["Provider", "Total Bookings"]],
      body: topProviders.map((p) => [p.provider, p.totalBookings]),
    });

    nextY = doc.lastAutoTable.finalY + 10;
    doc.text("📍 Top Booking Locations", 14, nextY);
    nextY += 5;
    autoTable(doc, {
      startY: nextY,
      head: [["Location", "Booking Count"]],
      body: locations.map((l) => [l.location, l.bookingCount]),
    });

    doc.text(
      `Generated on: ${new Date().toLocaleString()}`,
      14,
      doc.internal.pageSize.height - 10
    );
    doc.save("Analytics_Report.pdf");
  };

  const downloadCSV = () => {
    const headers = ["Metric,Value\n"];
    const rows = summaryCards.map((c) => `${c.label},${c.value}`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Analytics_Report.csv";
    link.click();
  };

  const charts = [
    {
      key: "topServices",
      title: "📈 Most Booked Services",
      subtitle: "Category-wise performance overview",
      chart: (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={topServices}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="category" tick={{ fill: "#4b2c15" }} />
            <YAxis tick={{ fill: "#4b2c15" }} />
            <Tooltip contentStyle={{ backgroundColor: "#fff7ed", border: "1px solid #fb923c", borderRadius: "8px" }} />
            <Bar dataKey="totalBookings" radius={[6, 6, 0, 0]} barSize={35}>
              {topServices.map((_, i) => (
                <Cell key={i} fill={chartColors[i % chartColors.length]} />
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
            <Pie data={topProviders} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="totalBookings" nameKey="provider" label>
              {topProviders.map((_, i) => (
                <Cell key={i} fill={chartColors[i % chartColors.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" />
          </PieChart>
        </ResponsiveContainer>
      ),
    },
    {
      key: "monthlyBookings",
      title: "📅 Monthly Booking Trends",
      subtitle: "Bookings over the past 12 months",
      chart: (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={bookingsTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fill: "#4b2c15" }} />
            <YAxis tick={{ fill: "#4b2c15" }} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#6e290c"
              strokeWidth={3}
              dot={{ r: 4, stroke: "#6e290c", fill: "#d4a373" }}
            />
          </LineChart>
        </ResponsiveContainer>
      ),
    },
    {
      key: "locations",
      title: "📍 Top Booking Locations",
      subtitle: "Cities with highest activity",
      chart: (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart layout="vertical" data={locations}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" />
            <YAxis dataKey="location" type="category" width={120} />
            <Tooltip />
            <Bar dataKey="bookingCount" radius={[0, 8, 8, 0]} barSize={25}>
              {locations.map((_, i) => (
                <Cell key={i} fill={chartColors[i % chartColors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ),
    },
  ];

  const filteredCharts = showOnly ? charts.filter((c) => c.key === showOnly) : charts;

  return (
    <div className="space-y-10 animate-fadeIn">
      {!showOnly && (
        <div className="flex items-center justify-start gap-70 mb-4">
          <h1 className="text-2xl font-semibold text-[#6e290c]">📊 Admin Analytics Dashboard</h1>
          <div className="flex gap-2 ml-4">
            <button
              onClick={downloadReport}
              className="bg-[#6e290c] text-white px-4 py-2 rounded-lg shadow hover:bg-[#5a210a]"
            >
              Download PDF
            </button>
            <button
              onClick={downloadCSV}
              className="bg-[#d4a373] text-white px-4 py-2 rounded-lg shadow hover:bg-[#c38b5a]"
            >
              Download CSV
            </button>
          </div>
        </div>
      )}

      {!showOnly && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {summaryCards.map((card, i) => (
            <div
              key={i}
              className="bg-white shadow-lg rounded-2xl p-5 border-l-4"
              style={{ borderColor: card.color }}
            >
              <h3 className="text-sm text-gray-500">{card.label}</h3>
              <p className="text-2xl font-bold" style={{ color: card.color }}>
                {card.value}
              </p>
            </div>
          ))}
        </div>
      )}

      <div
        className={`grid ${
          filteredCharts.length === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
        } gap-8 mt-6`}
      >
        {filteredCharts.map((card, i) => (
          <div
            key={i}
            className="bg-gradient-to-br from-[#fff7ed] to-[#fff1f0] rounded-3xl shadow-xl border border-[#fcd5b5] p-6 relative overflow-hidden h-[400px]"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-xl font-bold text-[#7c2d12]">{card.title}</h2>
                <p className="text-sm text-[#92400e]">{card.subtitle}</p>
              </div>
              <div className="bg-[#fb923c] text-white px-3 py-1 rounded-full text-xs shadow">
                Live Data
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
