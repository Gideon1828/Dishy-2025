import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Home1 from "./pages/Home1.jsx";
import Login from "../../server/auth/Login.jsx";
import Register from "../../server/auth/Register.jsx";
import Working from "./pages/Working.jsx";
import ResultsPage from "./pages/ResultsPage.jsx";
import VisitDish from "./pages/VisitDish.jsx";
import Favorites from "./pages/Favorites.jsx";
import LanguageSwitcher from "./LanguageSwitcher.jsx"; // Import the LanguageSwitcher
//Only Header ,Footer,Login and Register components can be translated to Tamil
//Other Components are Not yet Translated
export default function App() {
  return (
    <div>
      {/* Common header with Language Switcher */}
      <header
        style={{
          display: "flex",
          justifyContent: "flex-end",
          padding: "10px",
          background: "#f7f7f7",
        }}
      >
        <LanguageSwitcher />
      </header>

      <Routes>
        <Route path="/" element={<Home1 />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/working" element={<Working />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/visit-dish/:id" element={<VisitDish />} />
        <Route path="/favorite" element={<Favorites />} />
      </Routes>
    </div>
  );
}
