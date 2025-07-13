import logo from "../assets/logo.png";
import Header from "../components/Header.jsx";
import Imagecarousals from "../components/Imagecarousals.jsx";
import SearchByIngredient from "../components/SearchByIngredient.jsx";
import Footer from "../components/Footer.jsx";
import "./Working.css";
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Working = () => {
  const [showSearch, setShowSearch] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const [showConfirm, setShowConfirm] = useState(false);
  const [allowBack, setAllowBack] = useState(false); // to allow back after confirmation

  useEffect(() => {
    // Push a dummy state once when entering working page
    window.history.pushState({ confirmBack: true }, "");

    const handlePopState = (event) => {
      if (allowBack) {
        // User confirmed, allow normal back navigation
        return;
      }

      // Prevent showing multiple modals if already open
      if (showConfirm) return;

      // Show confirmation modal on back button press
      setShowConfirm(true);

      // IMPORTANT: Do NOT push new state here to avoid infinite loop
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [allowBack, showConfirm]);

  const handleReadyClick = () => {
    setShowSearch(true);
  };

  const handleConfirmYes = () => {
    setShowConfirm(false);
    setAllowBack(true);

    // Clear login info
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("token");

    // Go back one step in history (which will now be allowed)

    // Or navigate explicitly:
    navigate("/login", { replace: true });
  };

  const handleConfirmNo = () => {
    setShowConfirm(false);
    // Stay on current page, nothing else needed because we already pushed state
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Header />

      {/* Pass the callback as prop */}
      <Imagecarousals onReadyClick={handleReadyClick} />

      {/* Conditionally render SearchByIngredient */}
      {showSearch && <SearchByIngredient />}

      <Footer />
      {showConfirm && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal-content">
            <img src={logo} alt="Logo" className="confirm-logo" />
            <p>Are you sure you want to logout and leave this page?</p>
            <div className="confirm-buttons">
              <button className="confirm-yes" onClick={handleConfirmYes}>
                Yes
              </button>
              <button className="confirm-no" onClick={handleConfirmNo}>
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Working;
