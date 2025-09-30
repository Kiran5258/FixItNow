import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Userprovider, { userContext } from './content/Userprovider';
import Home from './pages/Dashboard/Home';
import Registration from './pages/Auth/Registration';
import Login from './pages/Auth/Login';
import ProviderProfileForm from "./pages/Auth/ProviderProfileForm"; 

function App() {
  return (
    <Userprovider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/provider-profile"
          element={
            <userContext.Consumer>
              {({ user }) => <ProviderProfileForm user={user} />}
            </userContext.Consumer>
          }
        />
      </Routes>
    </Userprovider>
  );
}

export default App;