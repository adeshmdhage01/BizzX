import React, { useState } from "react";
import axios from "axios";
import "./Register.css";
import Popup from "./Popup";

function Register() {
  const [register, setRegister] = useState({
    ownerName: "",
    username: "",
    password: "",
    contact: "",
    email: "",
    shopName: "",
    shopAddress: "",
    gstNumber: "",
    shopActNumber: "",
    // --- NEW LOGIC ADDED ---
    bankAccountNumber: "",
    bankIfscCode: "",
    upiId: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [popupShow, setPopupShow] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRegister((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!register.ownerName || !register.username || !register.password) {
      setPopupMessage("Name, Username, and Password are required.");
      setPopupShow(true);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8080/user/signup", register);
      if (response.data === true) {
        setPopupMessage("User Registered Successfully");
        setPopupShow(true);
        setTimeout(() => { window.location.href = "/login"; }, 1200);
      } else {
        setPopupMessage("User already exist");
        setPopupShow(true);
      }
    } catch (error) {
      setPopupMessage("Registration failed. Try again.");
      setPopupShow(true);
    } finally { setLoading(false); }
  };

  return (
    <>
      <div className="register-page">
        <div className="register-card">
          <h2 className="register-title">Create Account</h2>
          <form className="register-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="field"><label>Name*</label><input type="text" name="ownerName" placeholder="Full name" value={register.ownerName} onChange={handleChange} required /></div>
              <div className="field"><label>Username*</label><input type="text" name="username" placeholder="Username" value={register.username} onChange={handleChange} required /></div>
              <div className="field">
                <label>Password*</label>
                <div className="password-row">
                  <input type={showPassword ? "text" : "password"} name="password" value={register.password} onChange={handleChange} required />
                  <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>{showPassword ? "Hide" : "Show"}</button>
                </div>
              </div>
              <div className="field"><label>Contact*</label><input type="text" name="contact" value={register.contact} onChange={handleChange} required /></div>
              <div className="field"><label>Email*</label><input type="email" name="email" value={register.email} onChange={handleChange} required /></div>
              <div className="field"><label>Shop Name*</label><input type="text" name="shopName" value={register.shopName} onChange={handleChange} required /></div>
              <div className="field full"><label>Shop Address*</label><input type="text" name="shopAddress" value={register.shopAddress} onChange={handleChange} required /></div>
              
              {/* NEW BANK FIELDS */}
              <div className="field"><label>Account Number</label><input type="text" name="bankAccountNumber" placeholder="Bank Acc No" value={register.bankAccountNumber} onChange={handleChange} /></div>
              <div className="field"><label>IFSC Code</label><input type="text" name="bankIfscCode" placeholder="IFSC" value={register.bankIfscCode} onChange={handleChange} /></div>
              <div className="field"><label>UPI ID (for QR)</label><input type="text" name="upiId" placeholder="example@upi" value={register.upiId} onChange={handleChange} /></div>

              <div className="field"><label>GST Number</label><input type="text" name="gstNumber" value={register.gstNumber} onChange={handleChange} /></div>
              <div className="field"><label>Shop Act Number</label><input type="text" name="shopActNumber" value={register.shopActNumber} onChange={handleChange} /></div>
            </div>
            <button className="register-btn" type="submit" disabled={loading}>{loading ? "Signing up..." : "Signup"}</button>
          </form>
          <p className="register-bottom-text">Already have an account? <a href="/login">Login</a></p>
        </div>
      </div>
      <Popup show={popupShow} message={popupMessage} onClose={() => setPopupShow(false)} />
    </>
  );
}
export default Register;