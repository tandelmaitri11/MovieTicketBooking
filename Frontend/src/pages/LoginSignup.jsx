import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "react-hot-toast";
import { Mail, Phone, Lock, ChevronRight } from "lucide-react";

export default function LoginSignup({ setUserEmail }) {
  const [isLogin, setIsLogin] = useState(true);
  const [useEmail, setUseEmail] = useState(true);
  const [form, setForm] = useState({ email: "", phone: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const payload = useEmail
          ? { email: form.email, password: form.password }
          : { phone: form.phone, password: form.password };
        const res = await api.post("/auth/login", payload);

        localStorage.setItem("authToken", res.data.accessToken);
        localStorage.setItem("userEmail", res.data.email);
        localStorage.setItem("isAdmin", res.data.isAdmin ? "true" : "false");
        setUserEmail(res.data.email);

        toast.success("Login Successful!");
        navigate(res.data.isAdmin ? "/admin" : "/");
      } else {
        await api.post("/auth/signup", form);
        toast.success("Signup Successful!");
        setIsLogin(true);
        setForm({ email: "", phone: "", password: "" });
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    }
  };

  const handleGoogleLogin = async (response) => {
    try {
      const res = await api.post("/auth/google-login", {
        credential: response.credential,
      });

      localStorage.setItem("authToken", res.data.accessToken);
      localStorage.setItem("userEmail", res.data.email);
      localStorage.setItem("isAdmin", res.data.isAdmin ? "true" : "false");
      setUserEmail(res.data.email);

      toast.success("Logged in with Google!");
      navigate(res.data.isAdmin ? "/admin" : "/");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Google login failed");
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
            Welcome to Movie Booking
          </p>
          <h2 className="text-3xl font-bold text-white mt-2">
            {isLogin ? "Sign in" : "Create account"}
          </h2>
          <p className="text-sm text-gray-400 mt-2">
            {isLogin
              ? "Login to book your favorite shows."
              : "Join now and start booking instantly."}
          </p>
        </div>

        {/* login mode switch */}
        {isLogin && (
          <div className="flex items-center p-1 rounded-full bg-black/40 border border-white/10 mb-6">
            <button
              type="button"
              onClick={() => setUseEmail(true)}
              className={`flex-1 py-2 rounded-full text-sm transition ${
                useEmail
                  ? "bg-primary text-white shadow-md"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Email
            </button>
            <button
              type="button"
              onClick={() => setUseEmail(false)}
              className={`flex-1 py-2 rounded-full text-sm transition ${
                !useEmail
                  ? "bg-primary text-white shadow-md"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Phone
            </button>
          </div>
        )}

        {/* form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {(useEmail || !isLogin) && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20 transition">
                <Mail className="w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required={!isLogin || useEmail}
                  placeholder="Enter your email"
                  className="w-full bg-transparent outline-none text-white placeholder:text-gray-500 text-sm"
                />
              </div>
            </div>
          )}

          {(!useEmail || !isLogin) && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Phone Number
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20 transition">
                <Phone className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required={!isLogin || !useEmail}
                  placeholder="Enter your phone number"
                  className="w-full bg-transparent outline-none text-white placeholder:text-gray-500 text-sm"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Password
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20 transition">
              <Lock className="w-4 h-4 text-gray-400" />
              <input
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                required
                placeholder="Enter your password"
                className="w-full bg-transparent outline-none text-white placeholder:text-gray-500 text-sm"
              />
            </div>

            {isLogin && useEmail && (
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-xs text-primary/90 hover:underline mt-2"
              >
                Forgot password?
              </button>
            )}
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dull transition text-white py-2.5 rounded-xl font-medium shadow-lg"
          >
            {isLogin ? "Login" : "Create Account"}
            <ChevronRight className="w-4 h-4" />
          </button>
        </form>

        {/* divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-gray-400">OR CONTINUE WITH</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* google */}
        <div className="flex justify-center">
          <div className="rounded-xl overflow-hidden border border-white/10">
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => toast.error("Google Login Failed")}
            />
          </div>
        </div>

        {/* toggle login/signup */}
        <p className="text-center mt-7 text-sm text-gray-400">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <span
            onClick={() => {
              setIsLogin(!isLogin);
              setForm({ email: "", phone: "", password: "" });
            }}
            className="text-primary cursor-pointer ml-1 hover:underline font-medium"
          >
            {isLogin ? "Sign Up" : "Login"}
          </span>
        </p>
      </div>
    </div>
  );
}
