import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import Header from "../components/Header.jsx";
import { Link } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";
import Modal from "../context/Modal.jsx";

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [forgotMode, setForgotMode] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [modal, setModal] = useState({
    message: "",
    type: "alert",
    variant: "success",
  });

  const handleEmailChange = useCallback((e) => setEmail(e.target.value), []);
  const handlePasswordChange = useCallback((e) => setPassword(e.target.value), []);

  const handleSendOtp = async () => {
    if (!email)
      return setModal({
        message: "Enter your email",
        type: "prompt",
        variant: "error",
      });

    try {
      const res = await axios.post("https://dishy-2g4s.onrender.com/send-otp", { email });
      setModal({
        message: res.data.message,
        type: "prompt",
        variant: "success",
      });
      setOtpSent(true);
    } catch (err) {
      setModal({
        message: err.response?.data?.error || "Failed to send OTP",
        type: "prompt",
        variant: "error",
      });
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp)
      return setModal({
        message: "Enter the OTP",
        type: "prompt",
        variant: "error",
      });

    try {
      const res = await axios.post("https://dishy-2g4s.onrender.com/verify-otp", { email, otp });
      setModal({
        message: res.data.message,
        type: "prompt",
        variant: "success",
      });
      setOtpVerified(true);
    } catch (err) {
      setModal({
        message: err.response?.data?.error || "OTP verification failed",
        type: "prompt",
        variant: "error",
      });
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword)
      return setModal({
        message: "Fill all password fields",
        type: "prompt",
        variant: "error",
      });

    if (newPassword !== confirmPassword)
      return setModal({
        message: "Passwords do not match",
        type: "prompt",
        variant: "error",
      });

    try {
      const res = await axios.post("https://dishy-2g4s.onrender.com/reset-password", {
        email,
        newPassword,
      });
      setModal({
        message: res.data.message,
        type: "alert",
        variant: "success",
      });
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("token", res.data.token);
      navigate("/working");
    } catch (err) {
      setModal({
        message: err.response?.data?.error || "Password reset failed",
        type: "prompt",
        variant: "error",
      });
    }
  };

  const loginRequest = async () => {
    setLoading(true);
    try {
      const res = await axios.post("https://dishy-2g4s.onrender.com/login", {
        email,
        password,
      });

      setModal({
        message: res.data.message,
        type: "alert",
        variant: "success",
      });

      setTimeout(() => {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("token", res.data.token);
        navigate("/working");
      }, 2000);
    } catch (err) {
      setModal({
        message: err.response?.data?.error || t("login.loginFailed"),
        type: "alert",
        variant: "error",
      });
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
      {modal.message && (
        <Modal
          message={modal.message}
          type={modal.type}
          variant={modal.variant}
          onClose={() => setModal({ ...modal, message: "" })}
        />
      )}

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
                  <p style={{ textAlign: "center", margin: "10px 0", fontWeight: "bold" }}>OR</p>
                  <div className="oauth-buttons">
                  
                  <a
                  href="https://dishy-2g4s.onrender.com/auth/google"
                  className="oauth-btn google-btn"
                    >
                    <img
                  src="/google.png"
                  alt="Google"
                   className="oauth-icon"
                  />
                  
                </a>

                <a
                  href="https://dishy-2g4s.onrender.com/auth/github"
                  className="oauth-btn github-btn"
                >
                  <img
                    src="/github.png"
                    alt="GitHub"
                    className="oauth-icon"
                  />
                  
                </a>
              </div>
              {/*<p className="login-or">or Login with</p>
              <div className="login-icons">
              <img src="/google.png" alt="Google" />
              <img src="/github.png" alt="Github" />
              </div>*/}

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

              {!forgotMode && (
                <div className="login-footer">
                  <p
                    className="forgot-link"
                    onClick={() => setForgotMode(true)}
                    style={{ cursor: "pointer", marginTop: "10px", color: "#007bff" }}
                  >
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
