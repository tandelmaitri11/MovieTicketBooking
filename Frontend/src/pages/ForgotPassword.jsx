import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { toast } from "react-hot-toast";
import { Mail, ChevronRight } from "lucide-react";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      toast.success("If the email exists, an OTP was sent.");
      navigate("/reset-password", { state: { email } });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 py-10 relative overflow-hidden">
      {/* background glow */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/25 blur-[120px] rounded-full" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-red-500/20 blur-[120px] rounded-full" />

      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-7 sm:p-8">
        {/* header */}
        <div className="text-center mb-7">
          <p className="text-xs uppercase tracking-widest text-gray-400">
            Account Recovery
          </p>
          <h2 className="text-3xl font-bold text-white mt-2">Forgot Password</h2>
          <p className="text-sm text-gray-400 mt-2">
            Enter your email. We’ll send you an OTP to reset your password.
          </p>
        </div>

        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Email
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20 transition">
              <Mail className="w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent outline-none text-white placeholder:text-gray-500 text-sm"
                placeholder="Enter your email"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Tip: check spam/junk folder if you don’t receive OTP.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dull transition text-white py-2.5 rounded-xl font-medium shadow-lg disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send OTP"}
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 transition text-gray-200 py-2.5 rounded-xl font-medium"
          >
            Back to Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
