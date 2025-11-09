import {  Routes, Route } from "react-router-dom";

import Home from "./pages/Dashboard/Home";
import Registration from "./pages/Auth/Registration";
import Login from "./pages/Auth/Login";
import ProviderDashboard from "./pages/Dashboard/ProviderDashboard";
import CustomerDashboard from "./pages/Dashboard/CustomerDashboard";
import AdminDashboard from "./pages/Dashboard/AdminDashboard";

import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import ProviderDetailPage from "./pages/provider/ProviderDetailPage";
import BookingSummaryPage from "./pages/Customer/BookingSummaryPage";
import ChatPage from "./components/ChatPage";

function App() {
  return (
    <AuthProvider>
      
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/provider-dashboard"
            element={
              <ProtectedRoute>
                <ProviderDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer-dashboard"
            element={
              <ProtectedRoute>
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Provider Detail Page */}
          <Route
            path="/provider/:id"
            element={
              <ProtectedRoute>
                <ProviderDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Booking Summary Page */}
          <Route
            path="/booking-summary"
            element={
              <ProtectedRoute>
                <BookingSummaryPage />
              </ProtectedRoute>
            }
          />

          {/* Chat Route (dynamic) */}
          <Route
            path="/chat/:receiverId"
            element={
              <ProtectedRoute>
                <ChatPage/>
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Home />} />
        </Routes>
      
    </AuthProvider>
  );
}

export default App;
