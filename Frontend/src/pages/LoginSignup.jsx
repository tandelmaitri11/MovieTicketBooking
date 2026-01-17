import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api/api"
import { GoogleLogin } from "@react-oauth/google"
import { toast } from "react-hot-toast"


export default function LoginSignup({ setUserEmail }) {
  const [isLogin, setIsLogin] = useState(true)
  const [useEmail, setUseEmail] = useState(true)
  const [form, setForm] = useState({ email: "", phone: "", password: "" })
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (isLogin) {
        const payload = useEmail
          ? { email: form.email, password: form.password }
          : { phone: form.phone, password: form.password }
        const res = await api.post("/login", payload)

        localStorage.setItem("authToken", res.data.accessToken)
        localStorage.setItem("userEmail", res.data.email)
        setUserEmail(res.data.email) 

        toast.success("Login Successful!")
        navigate("/")
      } else {
        await api.post("/signup", form)
        toast.success("Signup Successful!")
        setIsLogin(true)
        setForm({ email: "", phone: "", password: "" })
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong")
    }
  }

  const handleGoogleLogin = async (response) => {
    try {
      const res = await api.post("/google-login", { credential: response.credential })

      localStorage.setItem("authToken", res.data.accessToken)
      localStorage.setItem("userEmail", res.data.email)
      setUserEmail(res.data.email)

      toast.success("Logged in with Google!")
      navigate("/")
    } catch (err) {
      toast.error(err?.response?.data?.message || "Google login failed")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-700">
        <h2 className="text-3xl font-bold text-center text-white mb-6">
          {isLogin ? "Login" : "Sign Up"}
        </h2>

        {isLogin && (
          <div className="flex justify-center gap-4 mb-6">
            <button
              type="button"
              onClick={() => setUseEmail(true)}
              className={`px-4 py-1 rounded-full border transition ${useEmail ? "bg-red-600 text-white border-red-600" : "text-gray-300 border-gray-600"}`}
            >
              Email
            </button>
            <button
              type="button"
              onClick={() => setUseEmail(false)}
              className={`px-4 py-1 rounded-full border transition ${!useEmail ? "bg-red-600 text-white border-red-600" : "text-gray-300 border-gray-600"}`}
            >
              Phone
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {(useEmail || !isLogin) && (
            <div>
              <label className="block font-medium mb-1 text-gray-300">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required={!isLogin || useEmail}
                className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                placeholder="Enter your email"
              />
            </div>
          )}
          {(!useEmail || !isLogin) && (
            <div>
              <label className="block font-medium mb-1 text-gray-300">Phone Number</label>
              <input
                type="text"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                required={!isLogin || !useEmail}
                className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                placeholder="Enter your phone number"
              />
            </div>
          )}

          <div>
            <label className="block font-medium mb-1 text-gray-300">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
              className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 outline-none"
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition">
            {isLogin ? "Login" : "Create Account"}
          </button>
        </form>

        <div className="flex items-center my-5">
          <div className="flex-1 border-t border-gray-700"></div>
          <span className="px-3 text-gray-400">OR</span>
          <div className="flex-1 border-t border-gray-700"></div>
        </div>

        <div className="flex justify-center">
          <GoogleLogin onSuccess={handleGoogleLogin} onError={() => toast.error("Google Login Failed")} />
        </div>

        <p className="text-center mt-6 text-gray-400">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <span
            onClick={() => { setIsLogin(!isLogin); setForm({ email: "", phone: "", password: "" }); }}
            className="text-red-500 cursor-pointer ml-1 hover:underline"
          >
            {isLogin ? "Sign Up" : "Login"}
          </span>
        </p>
      </div>
    </div>
  )
}
