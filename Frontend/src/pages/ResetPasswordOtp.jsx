import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/api";
import { toast } from "react-hot-toast";
import { Mail, KeyRound, Lock, ShieldCheck, RotateCw } from "lucide-react";

const ResetPasswordOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: location.state?.email || "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [expiresIn, setExpiresIn] = useState(10 * 60);
  const [resendCooldown, setResendCooldown] = useState(0);

  // ===== OTP boxes state (UI only) =====
  const OTP_LEN = 4;
  const [otpDigits, setOtpDigits] = useState(Array(OTP_LEN).fill(""));
  const otpRefs = useRef([]);

  // keep form.otp synced with boxes (logic unchanged)
  useEffect(() => {
    const joined = otpDigits.join("");
    setForm((prev) => ({ ...prev, otp: joined }));
  }, [otpDigits]);

  // if otp prefilled somehow, reflect in boxes
  useEffect(() => {
    if (!form.otp) return;
    const digits = String(form.otp).slice(0, OTP_LEN).split("");
    if (digits.length) {
      setOtpDigits((prev) => prev.map((_, i) => digits[i] || ""));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (expiresIn <= 0) return;
    const timer = setInterval(() => setExpiresIn((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [expiresIn]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleResendOtp = async () => {
    if (!form.email) {
      toast.error("Enter your email first");
      return;
    }
    try {
      await api.post("/auth/forgot-password", { email: form.email });
      toast.success("OTP resent");
      setExpiresIn(10 * 60);
      setResendCooldown(30);

      // UI reset
      setOtpDigits(Array(OTP_LEN).fill(""));
      otpRefs.current?.[0]?.focus?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to resend OTP");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setVerifying(true);
    try {
      await api.post("/auth/verify-otp", { email: form.email, otp: form.otp });
      setVerified(true);
      toast.success("OTP verified");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Invalid OTP");
    } finally {
      setVerifying(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/reset-password", {
        email: form.email,
        otp: form.otp,
        newPassword: form.newPassword,
      });
      toast.success("Password reset successful");
      navigate("/login");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  const mm = String(Math.floor(expiresIn / 60)).padStart(2, "0");
  const ss = String(expiresIn % 60).padStart(2, "0");

  const otpComplete = useMemo(() => form.otp?.length === OTP_LEN, [form.otp]);

  // ===== OTP boxes handlers =====
  const handleOtpChange = (index, value) => {
    const v = (value || "").replace(/\D/g, ""); // digits only
    if (!v) {
      setOtpDigits((prev) => {
        const next = [...prev];
        next[index] = "";
        return next;
      });
      return;
    }

    // support paste / multi digit input
    const chars = v.split("");
    setOtpDigits((prev) => {
      const next = [...prev];
      let i = index;
      for (const c of chars) {
        if (i >= OTP_LEN) break;
        next[i] = c;
        i++;
      }
      return next;
    });

    const nextIndex = Math.min(index + chars.length, OTP_LEN - 1);
    otpRefs.current?.[nextIndex]?.focus?.();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (otpDigits[index]) {
        // clear current
        setOtpDigits((prev) => {
          const next = [...prev];
          next[index] = "";
          return next;
        });
        return;
      }
      // move back
      if (index > 0) otpRefs.current?.[index - 1]?.focus?.();
    }
    if (e.key === "ArrowLeft" && index > 0) otpRefs.current?.[index - 1]?.focus?.();
    if (e.key === "ArrowRight" && index < OTP_LEN - 1) otpRefs.current?.[index + 1]?.focus?.();
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const text = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, OTP_LEN);
    if (!text) return;

    const arr = text.split("");
    setOtpDigits((prev) => prev.map((_, i) => arr[i] || ""));
    const last = Math.min(text.length - 1, OTP_LEN - 1);
    otpRefs.current?.[last]?.focus?.();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 py-10 relative overflow-hidden">
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/25 blur-[120px] rounded-full" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-red-500/20 blur-[120px] rounded-full" />

      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-7 sm:p-8">
        <div className="text-center mb-7">
          <p className="text-xs uppercase tracking-widest text-gray-400">
            Secure Account Recovery
          </p>
          <h2 className="text-3xl font-bold text-white mt-2">Reset Password</h2>
          <p className="text-sm text-gray-400 mt-2">
            {verified ? "Set a new password to continue." : "Enter the OTP sent to your email to verify."}
          </p>
        </div>

        {!verified ? (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20 transition">
                <Mail className="w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-transparent outline-none text-white placeholder:text-gray-500 text-sm"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* OTP Boxes */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">OTP</label>

              <div
                className="flex items-center justify-center gap-3"
                onPaste={handleOtpPaste}
              >
                {otpDigits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpRefs.current[i] = el)}
                    value={d}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    inputMode="numeric"
                    maxLength={OTP_LEN}
                    className="w-14 h-14 text-center text-lg font-semibold tracking-widest rounded-2xl border border-white/10 bg-black/35 text-white outline-none
                               focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition"
                    placeholder="•"
                    aria-label={`OTP digit ${i + 1}`}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between mt-3">
                <span
                  className={`text-xs px-3 py-1 rounded-full border ${
                    expiresIn > 0
                      ? "text-gray-300 border-white/10 bg-white/5"
                      : "text-red-300 border-red-500/30 bg-red-500/10"
                  }`}
                >
                  {expiresIn > 0 ? `Expires in ${mm}:${ss}` : "OTP expired"}
                </span>

                <span className="text-xs text-gray-500">
                  {resendCooldown > 0 ? `Resend cooldown: ${resendCooldown}s` : ""}
                </span>
              </div>

              <p className="text-xs text-gray-500 mt-2 text-center">
                Tip: Paste OTP directly — it will auto fill.
              </p>
            </div>

            {/* Verify */}
            <button
              type="submit"
              disabled={verifying || expiresIn <= 0 || !otpComplete}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dull transition text-white py-2.5 rounded-xl font-medium shadow-lg disabled:opacity-60"
            >
              <ShieldCheck className="w-4 h-4" />
              {verifying ? "Verifying..." : "Verify OTP"}
            </button>

            {/* Resend */}
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendCooldown > 0}
              className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 transition text-white py-2.5 rounded-xl font-medium disabled:opacity-60"
            >
              <RotateCw className="w-4 h-4" />
              {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : "Resend OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            {/* New password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">New Password</label>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20 transition">
                <Lock className="w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={form.newPassword}
                  onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                  className="w-full bg-transparent outline-none text-white placeholder:text-gray-500 text-sm"
                  placeholder="New password"
                  required
                />
              </div>
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Confirm Password</label>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20 transition">
                <Lock className="w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className="w-full bg-transparent outline-none text-white placeholder:text-gray-500 text-sm"
                  placeholder="Confirm new password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dull transition text-white py-2.5 rounded-xl font-medium shadow-lg disabled:opacity-60"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 transition text-gray-200 py-2.5 rounded-xl font-medium"
            >
              Back to Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordOtp;
