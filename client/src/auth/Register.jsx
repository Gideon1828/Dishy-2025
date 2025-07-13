import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";
import Header from "../components/Header.jsx";
import { Link } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";

export default function RegisterPage() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    username: "",
    email: "",
    password: "",
  });

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);

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
    if (!formData.email) {
      alert("Please enter your email first.");
      return;
    }
    try {
      const response = await axios.post(
        "https://dishy-2g4s.onrender.com/send-otp",
        {
          email: formData.email,
        }
      );
      alert(response.data.message);
      setOtpSent(true);
    } catch (error) {
      alert(error.response?.data?.error || "Failed to send OTP");
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      alert("Please enter the OTP.");
      return;
    }
    try {
      const response = await axios.post(
        "https://dishy-2g4s.onrender.com/verify-otp",
        {
          email: formData.email,
          otp,
        }
      );
      alert(response.data.message);
      setEmailVerified(true);
    } catch (error) {
      alert(error.response?.data?.error || "OTP verification failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailVerified) {
      alert("Please verify your email using the OTP first.");
      return;
    }
    try {
      const response = await axios.post(
        "https://dishy-2g4s.onrender.com/register",
        formData
      );
      alert(response.data.message);
      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.error || t("register.registrationFailed"));
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

            <form onSubmit={handleSubmit} className="register-form">
              <div className="input-group-row">
                <div className="input-group">
                  <label htmlFor="firstname">{t("register.firstName")}</label>
                  <input
                    id="firstname"
                    name="firstname"
                    type="text"
                    value={formData.firstname}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="lastname">{t("register.lastName")}</label>
                  <input
                    id="lastname"
                    name="lastname"
                    type="text"
                    value={formData.lastname}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

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
                  disabled={otpSent}
                />
                {!otpSent ? (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="otp-button"
                  >
                    Send OTP
                  </button>
                ) : (
                  <>
                    <input
                      type="text"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      className="otp-input"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      className="otp-button"
                    >
                      Verify OTP
                    </button>
                  </>
                )}
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
                {t("register.registerButton")}
              </button>

              <div className="register-footer">
                <p>
                  {t("register.alreadyHaveAccount")}{" "}
                  <Link to="/login">{t("register.login")}</Link>
                </p>
                <Link to="/" className="back-home">
                  {t("register.backHome")}
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
