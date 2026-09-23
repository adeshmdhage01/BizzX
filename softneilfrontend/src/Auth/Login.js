import React, { useState } from "react";
import axios from "axios";
import "./Login.css";
import Popup from "./Popup";

function Login() {
  // -------------------------------
  // Form field states
  // -------------------------------
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // -------------------------------
  // Popup states
  // -------------------------------
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  // -------------------------------
  // Login submit handler
  // -------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      username,
      password,
    };

    try {
      // -------------------------------
      // Backend API call
      // -------------------------------
      const response = await axios.post(
        "http://localhost:8080/user/login",
        data
      );

      // 🔍 Debug (keep during development)
      console.log("Login response:", response.data);

      /*
        ==================================================
        CORRECT FRONTEND LOGIC (BASED ON BACKEND RESPONSE)
        ==================================================
        Backend returns a USER OBJECT.
        Login is successful when:
          response.data.loginRole is NOT null
      */

      if (response.data && response.data.loginRole) {
        // -------------------------------
        // Login successful
        // -------------------------------
        const role = response.data.loginRole;

        // Save role for routing logic
        localStorage.setItem("loginRole", role);

        // ====================================================================
        // UPDATED: Save full user object (including userId) for Profile Update
        // ====================================================================
        localStorage.setItem("userData", JSON.stringify(response.data));
        // ====================================================================

        // -------------------------------
        // Role-based redirection
        // -------------------------------
        if (role === "ADMIN") {
          window.location.href = "/admin";
        } else {
          window.location.href = "/home";
        }
      }

      // If credentials are correct BUT user status is INACTIVE (I)
      else if (
        response.data &&
        response.data.loginStatus === "INACTIVE"
      ) {
        setPopupMessage(
          "You are not subscribed please purchase a plan"
        );
        setPopupOpen(true);
      }

      else {
        // -------------------------------
        // Invalid credentials
        // -------------------------------
        setPopupMessage("Invalid Username or password");
        setPopupOpen(true);
      }
    } catch (error) {
      // -------------------------------
      // Server / network error
      // -------------------------------
      console.error("Login error:", error);
      setPopupMessage("Something went wrong. Please try again.");
      setPopupOpen(true);
    }
  };

  // -------------------------------
  // Redirect to register page
  // -------------------------------
  const redirectToRegister = () => {
    window.location.href = "/register";
  };

  return (
    <>
      <div className="login-page">
        <div className="login-card">
          <h2 className="login-title">Welcome Back</h2>

          <form onSubmit={handleSubmit} className="login-form">
            <label>Username</label>
            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <label>Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit" className="login-btn">
              Login
            </button>
          </form>

          <p className="register-text">
            Don't have an account?{" "}
            <span
              onClick={redirectToRegister}
              className="register-link"
              role="button"
              tabIndex={0}
            >
              Register
            </span>
          </p>
        </div>
      </div>

      {/* -------------------------------
          Popup for error messages
          ------------------------------- */}
      <Popup
        show={popupOpen}
        message={popupMessage}
        onClose={() => setPopupOpen(false)}
      />
    </>
  );
}

export default Login;