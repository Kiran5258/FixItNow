import { Routes, Route } from "react-router-dom";
import Userprovider from "./content/Userprovider";
import Home from "./pages/Dashboard/Home";
import Registration from "./pages/Auth/Registration";
import Login from "./pages/Auth/Login";
import CustomerDashboard from "./pages/Dashboard/CustomerDashboard";
import ProviderDashboard from "./pages/Dashboard/ProviderDashboard";
import AdminDashboard from "./pages/Dashboard/AdminDashboard";

function App() {
  return (
    <Userprovider>
      <Routes>
        {/* Default Home */}
        <Route path="/" element={<Home />} />

        {/* Auth */}
        <Route path="/register" element={<Registration />} />
        <Route path="/login" element={<Login />} />

        {/* Dashboards */}
        <Route path="/customer-dashboard" element={<CustomerDashboard />} />
        <Route path="/provider-dashboard" element={<ProviderDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />

        {/* Fallback → Home */}
        <Route path="*" element={<Home />} />
      </Routes>
    </Userprovider>
  );
}

export default App;