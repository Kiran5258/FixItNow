import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
<<<<<<< HEAD
import { BrowserRouter } from "react-router-dom";
=======
import { BrowserRouter } from "react-router-dom"; // <-- add this
>>>>>>> bc6283a1b8465728100111aba7f88dc8bdddce84
import "./index.css";
import "leaflet/dist/leaflet.css";

import App from "./App.jsx";
<<<<<<< HEAD
import UserProvider from "./content/UserProvider.jsx";

=======
>>>>>>> bc6283a1b8465728100111aba7f88dc8bdddce84

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
<<<<<<< HEAD
      <UserProvider>
        <App />
      </UserProvider>
=======
      <App />
>>>>>>> bc6283a1b8465728100111aba7f88dc8bdddce84
    </BrowserRouter>
  </StrictMode>
);
