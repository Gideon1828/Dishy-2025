import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import Header from "../components/Header";
import { Link } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Login State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Forgot Password Flow
  const [forgotMode, setForgotMode] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleEmailChange = useCallback((e) => setEmail(e.target.value), []);
  const handlePasswordChange = useCallback((e) => setPassword(e.target.value), []);

  const handleSendOtp = async () => {
    if (!email) return alert("Enter your email");
    try {
      const res = await axios.post("https://dishy-2g4s.onrender.com/send-otp", { email });
      alert(res.data.message);
      setOtpSent(true);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to send OTP");
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return alert("Enter the OTP");
    try {
      const res = await axios.post("https://dishy-2g4s.onrender.com/verify-otp", { email, otp });
      alert(res.data.message);
      setOtpVerified(true);
    } catch (err) {
      alert(err.response?.data?.error || "OTP verification failed");
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) return alert("Fill all password fields");
    if (newPassword !== confirmPassword) return alert("Passwords do not match");

    try {
      const res = await axios.post("https://dishy-2g4s.onrender.com/reset-password", {
        email,
        newPassword,
      });
      alert(res.data.message);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("token", res.data.token);
      navigate("/working");
    } catch (err) {
      alert(err.response?.data?.error || "Password reset failed");
    }
  };

  const loginRequest = async () => {
    setLoading(true);
    try {
      const res = await axios.post("https://dishy-2g4s.onrender.com/login", {
        email,
        password,
      });
      alert(res.data.message);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("token", res.data.token);
      navigate("/working");
    } catch (err) {
      alert(err.response?.data?.error || t("login.loginFailed"));
    }
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (forgotMode) {
      if (!otpSent) handleSendOtp();
      else if (!otpVerified) handleVerifyOtp();
      else handleResetPassword();
    } else {
      loginRequest();
    }
  };

  return (
    <div>
      <Header />
      <div className="login-container">
        <div className="login-image">
          <div className="overlay"></div>
        </div>

        <div className="login-form-container">
          <div className="login-box">
            <h1 className="login-title">{forgotMode ? "Reset Password" : t("login.title")}</h1>

            <form onSubmit={handleSubmit} className="login-form">
              {!forgotMode ? (
                <>
                  <div className="input-group">
                    <label htmlFor="email">{t("login.emailLabel")}</label>
                    <input
                      id="email"
                      type="email"
                      placeholder={t("login.emailPlaceholder")}
                      value={email}
                      onChange={handleEmailChange}
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor="password">{t("login.passwordLabel")}</label>
                    <input
                      id="password"
                      type="password"
                      placeholder={t("login.passwordPlaceholder")}
                      value={password}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>

                  <button type="submit" className="login-button" disabled={loading}>
                    {loading ? t("login.loggingIn") : t("login.title")}
                  </button>
                </>
              ) : (
                <>
                  <div className="input-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={handleEmailChange}
                      required
                      disabled={otpSent}
                    />
                  </div>

                  {!otpSent && (
                    <button type="button" onClick={handleSendOtp} className="login-button">
                      Send OTP
                    </button>
                  )}

                  {otpSent && !otpVerified && (
                    <>
                      <div className="input-group">
                        <label>Enter OTP</label>
                        <input
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          required
                        />
                      </div>
                      <button type="button" onClick={handleVerifyOtp} className="login-button">
                        Verify OTP
                      </button>
                    </>
                  )}

                  {otpVerified && (
                    <>
                      <div className="input-group">
                        <label>New Password</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                        />
                      </div>
                      <div className="input-group">
                        <label>Confirm Password</label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                      </div>
                      <button type="submit" className="login-button">
                        Submit New Password
                      </button>
                    </>
                  )}
                </>
              )}

              {/* {!forgotMode && (
                <p className="forgot-link" onClick={() => setForgotMode(true)} style={{ cursor: "pointer", marginTop: "10px", color: "#007bff" }}>
                  Forgot password?
                </p>
              )} */}

              {!forgotMode && (
                <div className="login-footer">
                  <p className="forgot-link" onClick={() => setForgotMode(true)} style={{ cursor: "pointer", marginTop: "10px", color: "#007bff" }}>
                  Forgot password?
                  </p>
                  <p>
                    {t("login.noAccount")} <Link to="/register">{t("login.register")}</Link>
                  </p>
                  <Link to="/" className="back-home">
                    {t("login.backHome")}
                  </Link>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
