import React, { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api/api"
import { Loading } from "../components/Loading"
import timeFormat from "../lib/timeFormat"
import { dateFormat } from "../lib/dateFormat"
import getMediaUrl from "../lib/mediaUrl"

const Profile = () => {
  const navigate = useNavigate()
  const currency = import.meta.env.VITE_CURRENCY
  const baseUrl = api.defaults.baseURL || ""

  const [profile, setProfile] = useState(null)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)

  const [error, setError] = useState("")
  const [form, setForm] = useState({ name: "", phone: "" })

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (!token) {
      navigate("/login")
      return
    }

    const loadProfile = async () => {
      try {
        const [profileRes, bookingRes] = await Promise.all([
          api.get("/auth/me"),
          api.get("/api/bookings/my"),
        ])

        const p = profileRes.data
        setProfile(p)
        setForm({
          name: p?.name || "",
          phone: p?.phone || "",
        })

        setBookings(Array.isArray(bookingRes.data) ? bookingRes.data : [])

        if (p?.email) localStorage.setItem("userEmail", p.email)
        if (p?.profilePic) localStorage.setItem("userPhoto", p.profilePic)
      } catch (err) {
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          navigate("/login")
          return
        }
        setError(err?.response?.data?.message || "Failed to load profile.")
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("userPhoto")
    localStorage.removeItem("isAdmin")
    navigate("/login")
  }

  const handleSave = async () => {
    setSaving(true)
    setError("")
    try {
      const res = await api.put("/auth/me", form)
      setProfile(res.data)
      setEditing(false)
      if (res.data?.profilePic) localStorage.setItem("userPhoto", res.data.profilePic)
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update profile.")
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setForm({
      name: profile?.name || "",
      phone: profile?.phone || "",
    })
    setEditing(false)
    setError("")
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    setUploading(true)
    setError("")
    try {
      const formData = new FormData()
      formData.append("avatar", selectedFile)

      const res = await api.post("/auth/me/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      setProfile(res.data)
      setSelectedFile(null)
      if (res.data?.profilePic) localStorage.setItem("userPhoto", res.data.profilePic)
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to upload photo.")
    } finally {
      setUploading(false)
    }
  }

  const photoUrl = useMemo(() => {
    if (!profile?.profilePic) return ""
    if (profile.profilePic.startsWith("http")) return profile.profilePic
    return `${baseUrl}${profile.profilePic}`
  }, [profile])

  const previewUrl = useMemo(() => {
    if (!selectedFile) return ""
    return URL.createObjectURL(selectedFile)
  }, [selectedFile])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const stats = useMemo(() => {
    const totalBookings = bookings.length
    const totalSpent = bookings.reduce((sum, b) => sum + (Number(b.amount) || 0), 0)
    const totalTickets = bookings.reduce(
      (sum, b) => sum + (Array.isArray(b.bookedSeats) ? b.bookedSeats.length : 0),
      0
    )
    return { totalBookings, totalSpent, totalTickets }
  }, [bookings])

  const recentBookings = useMemo(() => bookings.slice(0, 3), [bookings])

  if (loading) return <Loading />

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top gradient header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-red-600/25 via-black/70 to-black" />
        <div className="relative max-w-6xl mx-auto px-4 pt-16 pb-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={
                    previewUrl ||
                    photoUrl ||
                    "https://ui-avatars.com/api/?name=User&background=111827&color=fff"
                  }
                  alt="Profile"
                  className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover border border-white/10 shadow-lg"
                />                
              </div>

              <div>
                <p className="text-white/70 text-sm">Welcome</p>
                <h1 className="text-2xl md:text-3xl font-extrabold leading-tight">
                  {profile?.name || "My Profile"}
                </h1>
                <p className="text-white/70 text-sm">{profile?.email || "Unknown email"}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/my-bookings")}
                className="rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 px-4 py-2 text-sm font-semibold transition"
              >
                View All Bookings
              </button>
              <button
                onClick={handleLogout}
                className="rounded-xl bg-red-600 hover:bg-red-700 px-4 py-2 text-sm font-semibold transition"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-white/70">Total Bookings</p>
              <p className="text-2xl font-extrabold mt-1">{stats.totalBookings}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-white/70">Tickets Booked</p>
              <p className="text-2xl font-extrabold mt-1">{stats.totalTickets}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-white/70">Total Spent</p>
              <p className="text-2xl font-extrabold mt-1">
                {currency}
                {stats.totalSpent}
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6">
          {/* Left: Profile card */}
          <div className="rounded-3xl border border-white/10 bg-white/5 shadow-xl overflow-hidden">
            <div className="p-6 md:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold">Account Details</h2>
                  <p className="text-sm text-white/60 mt-1">
                    Manage your profile info and photo
                  </p>
                </div>

                {!editing ? (
                  <button
                    onClick={() => {
                      setEditing(true)
                      setError("")
                    }}
                    className="shrink-0 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 px-4 py-2 text-sm font-semibold transition"
                  >
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      className="rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 px-4 py-2 text-sm font-semibold transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="rounded-xl bg-red-600 hover:bg-red-700 px-4 py-2 text-sm font-semibold transition disabled:opacity-60"
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-6 space-y-4">
                {/* Email */}
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs text-white/60">Email</p>
                  <p className="mt-1 font-semibold break-all">
                    {profile?.email || "Unknown"}
                  </p>
                </div>

                {/* Name */}
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs text-white/60">Name</p>
                  {editing ? (
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="mt-2 w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 outline-none focus:ring-2 focus:ring-red-500/40"
                      placeholder="Enter your name"
                    />
                  ) : (
                    <p className="mt-1 font-semibold">{profile?.name || "Not set"}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs text-white/60">Phone</p>
                  {editing ? (
                    <input
                      type="text"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="mt-2 w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 outline-none focus:ring-2 focus:ring-red-500/40"
                      placeholder="Enter your phone"
                    />
                  ) : (
                    <p className="mt-1 font-semibold">{profile?.phone || "Not set"}</p>
                  )}
                </div>

                {/* Photo uploader */}
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-white/60">Profile Photo</p>
                      <p className="text-sm text-white/70 mt-1">
                        JPG/PNG recommended (max size depends on your backend)
                      </p>
                    </div>
                    {selectedFile && (
                      <button
                        onClick={() => setSelectedFile(null)}
                        className="rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 px-3 py-1.5 text-xs font-semibold transition"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <div className="mt-4 flex flex-col gap-3">
                    <label className="group cursor-pointer rounded-2xl border border-dashed border-white/15 bg-white/5 hover:bg-white/10 transition p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold">
                            {selectedFile ? selectedFile.name : "Choose a photo"}
                          </p>
                          <p className="text-xs text-white/60 mt-1">
                            Click to browse
                          </p>
                        </div>
                        <span className="rounded-xl bg-white/10 border border-white/10 px-3 py-1.5 text-xs font-semibold">
                          Browse
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </label>

                    <button
                      onClick={handleUpload}
                      disabled={!selectedFile || uploading}
                      className="rounded-2xl bg-red-600 hover:bg-red-700 px-4 py-3 text-sm font-semibold transition disabled:opacity-60"
                    >
                      {uploading ? "Uploading..." : "Upload Photo"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 p-5 md:p-6 bg-black/20">
              <button
                onClick={() => navigate("/my-bookings")}
                className="w-full rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 px-4 py-3 text-sm font-semibold transition"
              >
                Manage My Bookings
              </button>
            </div>
          </div>

          {/* Right: Recent bookings */}
          <div className="rounded-3xl border border-white/10 bg-white/5 shadow-xl overflow-hidden">
            <div className="p-6 md:p-7 border-b border-white/10">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-extrabold">Recent Bookings</h3>
                  <p className="text-sm text-white/60 mt-1">
                    Your latest movie tickets & seat info
                  </p>
                </div>

                <button
                  onClick={() => navigate("/my-bookings")}
                  className="rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 px-4 py-2 text-sm font-semibold transition"
                >
                  See all
                </button>
              </div>
            </div>

            <div className="p-6 md:p-7">
              {bookings.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-black/20 p-6">
                  <p className="text-white/70">No bookings yet.</p>
                  <button
                    onClick={() => navigate("/")}
                    className="mt-4 rounded-2xl bg-red-600 hover:bg-red-700 px-4 py-3 text-sm font-semibold transition"
                  >
                    Explore Movies
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentBookings.map((item) => {
                    const title = item.show?.movie?.title || "Movie"
                    const poster = item.show?.movie?.poster_path
                    const runtime = item.show?.movie?.runtime
                    const showTime = item.show?.showDateTime
                    const seats = Array.isArray(item.bookedSeats) ? item.bookedSeats : []
                    const ticketsCount = seats.length
                    const amount = item.amount ?? 0

                    return (
                      <div
                        key={item._id}
                        className="group rounded-2xl border border-white/10 bg-black/20 hover:bg-black/30 transition overflow-hidden"
                      >
                        <div className="flex flex-col md:flex-row">
                          {/* Poster */}
                          <div className="md:w-56">
                            <div className="relative h-40 md:h-full">
                              <img
                                src={getMediaUrl(poster, baseUrl)}
                                alt={title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src =
                                    "https://via.placeholder.com/640x360?text=No+Poster"
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                              <div className="absolute bottom-3 left-3 right-3">
                                <p className="text-sm font-semibold truncate">{title}</p>
                                <p className="text-xs text-white/70">
                                  {runtime ? timeFormat(runtime) : "Runtime N/A"}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Details */}
                          <div className="flex-1 p-4 md:p-5 flex flex-col gap-3">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                              <div>
                                <p className="text-xs text-white/60">Show Time</p>
                                <p className="text-sm font-semibold">
                                  {showTime ? dateFormat(showTime) : "N/A"}
                                </p>
                              </div>

                              <div className="sm:text-right">
                                <p className="text-xs text-white/60">Amount</p>
                                <p className="text-lg font-extrabold">
                                  {currency}
                                  {amount}
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                                <p className="text-xs text-white/60">Tickets</p>
                                <p className="text-sm font-semibold">{ticketsCount}</p>
                              </div>
                              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                                <p className="text-xs text-white/60">Seats</p>
                                <p className="text-sm font-semibold truncate">
                                  {seats.length ? seats.join(", ") : "-"}
                                </p>
                              </div>
                            </div>

                            <div className="pt-2 flex gap-2">
                              <button
                                onClick={() => navigate("/my-bookings")}
                                className="rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 px-4 py-2 text-sm font-semibold transition"
                              >
                                View Details
                              </button>
                              <button
                                onClick={() => navigate("/")}
                                className="rounded-xl bg-red-600 hover:bg-red-700 px-4 py-2 text-sm font-semibold transition"
                              >
                                Book Again
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {bookings.length > 0 && (
              <div className="border-t border-white/10 p-5 md:p-6 bg-black/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <p className="text-sm text-white/70">
                  Showing <span className="font-semibold text-white">3</span> of{" "}
                  <span className="font-semibold text-white">{bookings.length}</span>{" "}
                  bookings
                </p>
                <button
                  onClick={() => navigate("/my-bookings")}
                  className="rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 px-4 py-3 text-sm font-semibold transition"
                >
                  View All Bookings
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom spacing */}
        <div className="h-10" />
      </div>
    </div>
  )
}

export default Profile
