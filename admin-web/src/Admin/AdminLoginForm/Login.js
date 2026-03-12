import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUseras_admin } from "../../Services/AdminServices/AllServices/UserService";

import "./Login.css";

export default function Login() {
  const [loginType, setLoginType] = useState("email"); // email or phone
  const [Email, setEmail] = useState("");
  const [Phone, setPhone] = useState("");
  const [Password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const payload =
        loginType === "email"
          ? { Email, Password }
          : { Phone, Password };

      const response = await loginUseras_admin(payload);

      if (response.status === 200) {
        navigate("/admin/verify-otp", {
          state: { Email, Phone },
        });
      } else {
        alert(`Login failed: ${response.data.error}`);
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed: An error occurred");
    }
  };

  return (
    <div className="log-container">
      <div className="form-container">
        <h2 className="title">Sign in to your account</h2>
      </div>

      <div className="form-wrapper">

        {/* 🔘 Toggle Button */}
        <div style={{ display: "flex", marginBottom: "20px" }}>
          <button
            type="button"
            onClick={() => setLoginType("email")}
            style={{
              flex: 1,
              padding: "10px",
              background: loginType === "email" ? "#4f46e5" : "#ddd",
              color: loginType === "email" ? "#fff" : "#000",
              border: "none",
              cursor: "pointer",
            }}
          >
            Email
          </button>

          <button
            type="button"
            onClick={() => setLoginType("phone")}
            style={{
              flex: 1,
              padding: "10px",
              background: loginType === "phone" ? "#4f46e5" : "#ddd",
              color: loginType === "phone" ? "#fff" : "#000",
              border: "none",
              cursor: "pointer",
            }}
          >
            Phone
          </button>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          
          {/* 📧 Email Input */}
          {loginType === "email" && (
            <div className="input-group">
              <label className="label">Email</label>
              <input
                type="text"
                value={Email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Email"
                required
                className="input"
              />
            </div>
          )}

          {/* 📱 Phone Input */}
          {loginType === "phone" && (
            <div className="input-group">
              <label className="label">Phone</label>
              <input
                type="text"
                value={Phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter Phone Number"
                required
                className="input"
              />
            </div>
          )}

          {/* 🔑 Password */}
          <div className="input-group">
            <label className="label">Password</label>
            <input
              type="password"
              value={Password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="input"
            />
          </div>

          <div className="button-wrapper">
            <button type="submit" className="submit-button">
              Login
            </button>
          </div>
        </form>

        <p className="footer-text">
          <Link to="/admin/forgot-password">
            <strong>Forgot Password?</strong>
          </Link>
        </p>
      </div>
    </div>
  );
}