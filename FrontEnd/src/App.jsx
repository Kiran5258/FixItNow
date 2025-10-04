import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Userprovider, { userContext } from './content/Userprovider';
import Home from './pages/Dashboard/Home';
import Registration from './pages/Auth/Registration';
import Login from './pages/Auth/Login';
// import ProviderProfileForm from "./pages/Auth/ProviderProfileForm"; 
import ProviderDashboard from "./pages/Dashboard/ProviderDashboard";
import CustomerDashboard from "./pages/Dashboard/CustomerDashboard";
import AdminDashboard from "./pages/Dashboard/AdminDashboard";


function App() {
  return (
    <Userprovider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/login" element={<Login />} />  
        <Route path="/provider-dashboard" element={<ProviderDashboard />} />
        <Route path="/customer-dashboard" element={<CustomerDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </Userprovider>
  );
}

export default App;