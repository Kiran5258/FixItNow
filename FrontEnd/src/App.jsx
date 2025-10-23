import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
<<<<<<< HEAD

import Home from "./pages/Dashboard/Home";
=======
import Userprovider from "./content/Userprovider";
>>>>>>> bc6283a1b8465728100111aba7f88dc8bdddce84
import Registration from "./pages/Auth/Registration";
import Login from "./pages/Auth/Login";
import ProviderDashboard from "./pages/Dashboard/ProviderDashboard";
import CustomerDashboard from "./pages/Dashboard/CustomerDashboard";
import AdminDashboard from "./pages/Dashboard/AdminDashboard";
<<<<<<< HEAD

import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import ProviderDetailPage from "./pages/provider/ProviderDetailPage";
import BookingSummaryPage from "./pages/Customer/BookingSummaryPage";

function App() {
  return (
    <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/login" element={<Login />} />

=======
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Userprovider>
        <Routes>
          <Route path="/register" element={<Registration />} />
          <Route path="/login" element={<Login />} />
>>>>>>> bc6283a1b8465728100111aba7f88dc8bdddce84
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
<<<<<<< HEAD

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

          {/* Catch-all route */}
          <Route path="*" element={<Home />} />
        </Routes>
    </AuthProvider>
=======
        </Routes>
      
    </Userprovider>
>>>>>>> bc6283a1b8465728100111aba7f88dc8bdddce84
  );
}

export default App;
