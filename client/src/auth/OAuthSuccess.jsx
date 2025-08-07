import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function OAuthSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const token = query.get("token");

    if (token) {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("token", token);
      navigate("/working"); // change this to your dashboard or main page
    } else {
      alert("Google login failed");
      navigate("/login");
    }
  }, []);

  return <div>Signing you in with Google...</div>;
}
