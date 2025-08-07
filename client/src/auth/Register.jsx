import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";
import Header from "../components/Header.jsx";
import { Link } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";

export default function RegisterPage() {
  const { t } = useTranslation();
  const [step, setStep] = useState("form"); // 'form' or 'otp'

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post("https://dishy-2g4s.onrender.com/send-otp", {
        email: formData.email,
      });
      console.log("OTP Send Response:", response.data);

    alert(response.data.message); // e.g. "OTP sent to your email"
    setStep("otp"); // Switch to OTP input screen
  } catch (error) {
  console.error("Error sending OTP:", error); // Log entire error
  console.error("Full response:", error.response); // See if server responded
  alert(error.response?.data?.error || "Failed to send OTP");
}
  };

  const handleVerifyOtpAndRegister = async (e) => {
    e.preventDefault();
    if (!otp) {
      alert("Please enter the OTP.");
      return;
    }

    try {
      const verifyResponse = await axios.post("https://dishy-2g4s.onrender.com/verify-otp", {
        email: formData.email,
        otp,
      });

      alert(verifyResponse.data.message); // OTP verified

      // Proceed with registration
      const registerResponse = await axios.post("https://dishy-2g4s.onrender.com/register", formData);
      alert(registerResponse.data.message); // Registration successful

      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.error || "OTP verification or registration failed");
    }
  };

  return (
    <div>
      <Header />
      <div className="register-container">
        <div className="register-image">
          <div className="overlay"></div>
        </div>

        <div className="register-form-container">
          <div className="register-box">
            <h1 className="register-title">{t("register.title")}</h1>
            <p className="register-subtitle">{t("register.subtitle")}</p>

            {step === "form" ? (
              <form onSubmit={handleSendOtp} className="register-form">
                <div className="input-group">
                  <label htmlFor="username">{t("register.username")}</label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="email">{t("register.email")}</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="password">{t("register.password")}</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button type="submit" className="register-button">
                  Continue
                </button>

                <div className="register-footer">
                  <p>
                    {t("register.alreadyHaveAccount")} <Link to="/login">{t("register.login")}</Link>
                  </p>
                  <Link to="/" className="back-home">
                    {t("register.backHome")}
                  </Link>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtpAndRegister} className="register-form">
                <div className="input-group">
                  <label>Enter OTP sent to your email</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter OTP"
                    required
                  />
                </div>
                <button type="submit" className="register-button">
                  Verify OTP & Register
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
