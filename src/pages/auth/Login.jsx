import React, { useContext, useState } from "react";
import axios from "../../api/axios";
import AuthContext from "../../context/AuthProvider";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

// ── Steps: "login" | "forgot" | "verify"
const Login = () => {
  const { setAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  const [step, setStep] = useState("login");
  const [stepLoading, setStepLoading] = useState(false);

  const [login, setLogin] = useState({ email: "", password: "" });
  const [forgotEmail, setForgotEmail] = useState("");
  const [verify, setVerify] = useState({ otp: "", password: "", confirm_password: "" });
  const [showPass, setShowPass] = useState({ password: false, confirm: false });

  /* ── Login ── */
  const onFormSubmit = async (e) => {
    e.preventDefault();
    try {
      setStepLoading(true);
      const { data } = await axios.post("/auth/login", login);
      if (data?.token || data?.data?.token) {
        const accessToken = data?.token || data?.data?.token;
        localStorage.setItem("token", accessToken);
        localStorage.setItem("admin", data?.data?.admin ? "true" : "false");
        setAuth({ email: login.email, accessToken });
        setLogin({ email: "", password: "" });
        toast.success(data?.message || "Login Successful");
        navigate("/dashboard");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.response?.data?.error || "Login Failed");
    } finally {
      setStepLoading(false);
    }
  };

  /* ── Forgot Password ── */
  const onForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) { toast.warning("Please enter your email."); return; }
    try {
      setStepLoading(true);
      const { data } = await axios.post("/auth/forget-password", { email: forgotEmail.trim() });
      if (data?.status === 1 || data?.message) {
        toast.success(data?.message || "OTP sent to your email.");
        setStep("verify");
      } else {
        toast.error(data?.message || "Failed to send OTP.");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send OTP.");
    } finally {
      setStepLoading(false);
    }
  };

  /* ── Verify OTP + Reset Password ── */
  const onVerifySubmit = async (e) => {
    e.preventDefault();
    if (!verify.otp.trim()) { toast.warning("Please enter the OTP."); return; }
    if (!verify.password.trim()) { toast.warning("Please enter a new password."); return; }
    if (verify.password !== verify.confirm_password) { toast.warning("Passwords do not match."); return; }
    try {
      setStepLoading(true);
      const { data } = await axios.post("/auth/verify-otp", {
        email: forgotEmail.trim(),
        otp: verify.otp.trim(),
        password: verify.password,
        confirm_password: verify.confirm_password,
      });
      if (data?.status === 1 || data?.message) {
        toast.success(data?.message || "Password reset successfully.");
        setStep("login");
        setForgotEmail("");
        setVerify({ otp: "", password: "", confirm_password: "" });
      } else {
        toast.error(data?.message || "OTP verification failed.");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "OTP verification failed.");
    } finally {
      setStepLoading(false);
    }
  };

  /* ── Shared input style ── */
  const inputCls = "form-control shadow-none";

  // ── Eye Icon SVGs — paste above the Login component ──
  const EyeOpen = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  const EyeOff = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

  return (
    <div>
      <section className="auth_sec bgColor d-flex align-items-center justify-content-center">
        <div className="container">
          <div className="inner_login swap_tab cus_card p-4 p-lg-5">
            <div className="row align-items-center justify-content-between">

              {/* Left image */}
              <div className="col-12 col-md-6 order-2 order-md-1">
                <div className="login_images_column mx-sm-4 mx-md-0 text-center pe-5 mb-md-0">
                  <img
                    src="/images/auth/login-1.png"
                    alt="login-auth"
                    className="img-fluid"
                  />
                </div>
              </div>

              {/* Right form */}
              <div className="col-12 col-md-6 order-1 order-md-2">
                <div className="login_images_column mb-0 mb-md-0 px-lg-4">

                  {/* ══ STEP: LOGIN ══ */}
                  {step === "login" && (
                    <form onSubmit={onFormSubmit}>
                      <h3 className="headingLogin mb-3">LOGIN</h3>

                      <div className="form_box mb-4">
                        <label className="form-label">Email</label>
                        <div className="input-group">
                          <input
                            type="email"
                            className={inputCls}
                            placeholder="Enter Your Email"
                            name="email"
                            value={login.email}
                            onChange={(e) => setLogin({ ...login, email: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="form_box mb-2">
                        <label className="form-label">Password</label>
                        <div className="input-group">
                          <input
                            type={showPass.password ? "text" : "password"}
                            className={inputCls}
                            placeholder="Password"
                            name="password"
                            value={login.password}
                            onChange={(e) => setLogin({ ...login, password: e.target.value })}
                            required
                            style={{ borderRight: "none" }}
                          />
                          <span
                            className="input-group-text"
                            onClick={() => setShowPass((p) => ({ ...p, password: !p.password }))}
                            style={{
                              cursor: "pointer",
                              background: "#000910",
                              border: "none",
                              color: showPass.password ? "#6C63FF" : "#6B7280",
                              transition: "color .2s",
                              padding: "0 12px",
                              userSelect: "none",
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = "#6C63FF"}
                            onMouseLeave={(e) => e.currentTarget.style.color = showPass.password ? "#6C63FF" : "#6B7280"}
                          >
                            {showPass.password ? <EyeOff /> : <EyeOpen />}
                          </span>
                        </div>
                      </div>

                      {/* Forgot password link */}
                      <div className="text-end mb-4">
                        <span
                          onClick={() => { setStep("forgot"); setForgotEmail(login.email); }}
                          style={{
                            fontSize: 13,
                            color: "#6C63FF",
                            cursor: "pointer",
                            textDecoration: "underline",
                            userSelect: "none",
                          }}
                        >
                          Forgot Password?
                        </span>
                      </div>

                      <div className="form_box text-center">
                        <button
                          type="submit"
                          className="active_btn px-3 py-2 mt-2"
                          disabled={stepLoading}
                          style={{ opacity: stepLoading ? 0.7 : 1 }}
                        >
                          {stepLoading ? "Logging in…" : "Login"}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* ══ STEP: FORGOT PASSWORD ══ */}
                  {step === "forgot" && (
                    <form onSubmit={onForgotSubmit}>
                      {/* Back button */}
                      <button
                        type="button"
                        onClick={() => setStep("login")}
                        style={{
                          background: "none", border: "none", padding: 0,
                          color: "#6C63FF", fontSize: 13, cursor: "pointer",
                          marginBottom: 16, display: "flex", alignItems: "center", gap: 4,
                        }}
                      >
                        ← Back to Login
                      </button>

                      <h3 className="headingLogin mb-1">Forgot Password</h3>
                      <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 24 }}>
                        Enter your registered email and we'll send you an OTP to reset your password.
                      </p>

                      <div className="form_box mb-4">
                        <label className="form-label">Email</label>
                        <div className="input-group">
                          <input
                            type="email"
                            className={inputCls}
                            placeholder="Enter Your Email"
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="form_box text-center">
                        <button
                          type="submit"
                          className="active_btn px-3 py-2 mt-2"
                          disabled={stepLoading}
                          style={{ opacity: stepLoading ? 0.7 : 1 }}
                        >
                          {stepLoading ? "Sending OTP…" : "Send OTP"}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* ══ STEP: VERIFY OTP + NEW PASSWORD ══ */}
                  {step === "verify" && (
                    <form onSubmit={onVerifySubmit}>
                      {/* Back button */}
                      <button
                        type="button"
                        onClick={() => setStep("forgot")}
                        style={{
                          background: "none", border: "none", padding: 0,
                          color: "#6C63FF", fontSize: 13, cursor: "pointer",
                          marginBottom: 16, display: "flex", alignItems: "center", gap: 4,
                        }}
                      >
                        ← Back
                      </button>

                      <h3 className="headingLogin mb-1">Verify OTP</h3>
                      <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 24 }}>
                        OTP sent to <strong>{forgotEmail}</strong>. Enter it below along with your new password.
                      </p>

                      {/* OTP */}
                      <div className="form_box mb-4">
                        <label className="form-label">OTP</label>
                        <div className="input-group">
                          <input
                            type="text"
                            className={inputCls}
                            placeholder="Enter OTP"
                            value={verify.otp}
                            onChange={(e) => setVerify({ ...verify, otp: e.target.value })}
                            maxLength={6}
                            required
                          />
                        </div>
                      </div>

                      {/* New Password */}
                      <div className="form_box mb-4">
                        <label className="form-label">New Password</label>
                        <div className="input-group">
                          <input
                            type={showPass.password ? "text" : "password"}
                            className={inputCls}
                            placeholder="New Password"
                            value={verify.password}
                            onChange={(e) => setVerify({ ...verify, password: e.target.value })}
                            required
                            style={{ borderRight: "none" }}
                          />
                          <span
                            className="input-group-text"
                            onClick={() => setShowPass((p) => ({ ...p, password: !p.password }))}
                            style={{
                              cursor: "pointer",
                              background: "#000910",
                              border: "none",
                              color: showPass.password ? "#6C63FF" : "#6B7280",
                              transition: "color .2s",
                              padding: "0 12px",
                              userSelect: "none",
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = "#6C63FF"}
                            onMouseLeave={(e) => e.currentTarget.style.color = showPass.password ? "#6C63FF" : "#6B7280"}
                          >
                            {showPass.password ? <EyeOff /> : <EyeOpen />}
                          </span>
                        </div>
                      </div>

                      {/* Confirm Password */}
                      <div className="form_box mb-4">
                        <label className="form-label">Confirm Password</label>
                        <div className="input-group">
                          <input
                            type={showPass.confirm ? "text" : "password"}
                            className={inputCls}
                            placeholder="Confirm Password"
                            value={verify.confirm_password}
                            onChange={(e) => setVerify({ ...verify, confirm_password: e.target.value })}
                            required
                            style={{ borderRight: "none" }}
                          />
                          <span
                            className="input-group-text"
                            onClick={() => setShowPass((p) => ({ ...p, confirm: !p.confirm }))}
                            style={{
                              cursor: "pointer",
                              background: "#000910",
                              border: "none",
                              color: showPass.confirm ? "#6C63FF" : "#6B7280",
                              transition: "color .2s",
                              padding: "0 12px",
                              userSelect: "none",
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = "#6C63FF"}
                            onMouseLeave={(e) => e.currentTarget.style.color = showPass.confirm ? "#6C63FF" : "#6B7280"}
                          >
                            {showPass.confirm ? <EyeOff /> : <EyeOpen />}
                          </span>
                        </div>

                        {/* Live match indicator */}
                        {verify.confirm_password && (
                          <small style={{
                            fontSize: 12, marginTop: 6, display: "block",
                            color: verify.password === verify.confirm_password ? "#22D3A4" : "#FF5E7D",
                          }}>
                            {verify.password === verify.confirm_password ? "✓ Passwords match" : "✗ Passwords do not match"}
                          </small>
                        )}
                      </div>

                      {/* Resend OTP */}
                      <div className="text-end mb-3">
                        <span
                          onClick={() => !stepLoading && onForgotSubmit({ preventDefault: () => { } })}
                          style={{
                            fontSize: 12, color: "#6C63FF",
                            cursor: stepLoading ? "not-allowed" : "pointer",
                            textDecoration: "underline", userSelect: "none",
                            opacity: stepLoading ? 0.5 : 1,
                          }}
                        >
                          Resend OTP
                        </span>
                      </div>

                      <div className="form_box text-center">
                        <button
                          type="submit"
                          className="active_btn px-3 py-2 mt-2"
                          disabled={stepLoading}
                          style={{ opacity: stepLoading ? 0.7 : 1 }}
                        >
                          {stepLoading ? "Verifying…" : "Reset Password"}
                        </button>
                      </div>
                    </form>
                  )}

                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Login;
