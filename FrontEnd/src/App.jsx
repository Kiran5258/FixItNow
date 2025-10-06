import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Userprovider from "./content/Userprovider";
import Home from "./pages/Dashboard/Home";
import Registration from "./pages/Auth/Registration";
import Login from "./pages/Auth/Login";
import ProviderDashboard from "./pages/Dashboard/ProviderDashboard";
import CustomerDashboard from "./pages/Dashboard/CustomerDashboard";
import AdminDashboard from "./pages/Dashboard/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Userprovider>
      
        <Routes>
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
        </Routes>
      
    </Userprovider>
  );
}

export default App;
