import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { verify_Otp, resend_Otp } from "../../Services/AdminServices/AllServices/UserService";

const VerifyOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { Email, Phone } = location.state || {};

  const [Otp, setOtp] = useState("");
  const [timer, setTimer] = useState(30);
  const [message, setMessage] = useState("");
  const [isOtpExpired, setIsOtpExpired] = useState(false);

  useEffect(() => {
    if (timer > 0 && !isOtpExpired) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(countdown);
    } else if (timer === 0) {
      setIsOtpExpired(true);
    }
  }, [timer, isOtpExpired]);

  const handleVerifyOtp = async () => {
    try {

      const payload = {
        Otp,
        ...(Email && { Email }),
        ...(Phone && { Phone }),
      };

      const response = await verify_Otp(payload);

      if (response.status === 200) {
        debugger
        setMessage(response.data.message);
        navigate("/admin/Users");
      }
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.error || "Failed to verify OTP");
    }
  };

  const handleResendOtp = async () => {
    try {

      const payload = {
        ...(Email && { Email }),
        ...(Phone && { Phone }),
      };

      const response = await resend_Otp(payload);

      if (response.status === 200) {
        setMessage(response.data.message);
        setTimer(30);
        setIsOtpExpired(false);
        setOtp("");
      }
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.error || "Failed to resend OTP");
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div style={styles.container}>
      <h4>Verify Your OTP</h4>

      <p>
        Enter the OTP sent to{" "}
        <strong>{Email ? Email : Phone}</strong>
      </p>

      <input
        type="text"
        value={Otp}
        onChange={(e) => setOtp(e.target.value)}
        maxLength="6"
        placeholder="Enter OTP"
        style={styles.input}
        disabled={isOtpExpired}
      />

      {!isOtpExpired && (
        <button onClick={handleVerifyOtp} style={styles.button}>
          Verify OTP
        </button>
      )}

      <p style={{ marginTop: 10, color: "gray" }}>
        Time left: {isOtpExpired ? "OTP Expired" : formatTime(timer)}
      </p>

      {isOtpExpired && (
        <button onClick={handleResendOtp} style={styles.resendButton}>
          Resend OTP
        </button>
      )}

      {message && <p style={{ marginTop: 10 }}>{message}</p>}
    </div>
  );
};

const styles = {
  container: {
    width: "300px",
    margin: "50px auto",
    padding: "30px",
    textAlign: "center",
    border: "1px solid #ddd",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
  },
  input: {
    padding: "10px",
    width: "90%",
    margin: "15px 0",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#4CAF50",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
    cursor: "pointer",
  },
  resendButton: {
    marginTop: "10px",
    padding: "10px 20px",
    backgroundColor: "#f39c12",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontSize: "14px",
    cursor: "pointer",
  },
};

export default VerifyOtp;