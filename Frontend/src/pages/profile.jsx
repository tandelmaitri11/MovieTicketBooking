import React from "react"
import { useNavigate } from "react-router-dom"

const Profile = () => {
  const navigate = useNavigate()

  const userEmail = localStorage.getItem("userEmail")
  const userPhoto = localStorage.getItem("userPhoto")

  if (!userEmail) {
    navigate("/login")
    return null
  }

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("userPhoto")
    navigate("/login")
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-2xl shadow-xl p-8">

        {/* Avatar */}
        <div className="flex justify-center mb-4">
          <img
            src={
              userPhoto ||
              "https://ui-avatars.com/api/?name=User&background=111827&color=fff"
            }
            alt="Profile"
            className="w-24 h-24 rounded-full border-2 border-red-500 object-cover"
          />
        </div>

        <h2 className="text-3xl font-bold text-center text-white mb-6">
          My Profile
        </h2>

        {/* User Info */}
        <div className="space-y-4">
          <div>
            <p className="text-gray-400 text-sm">Email</p>
            <p className="text-white text-lg font-medium">{userEmail}</p>
          </div>

          <div>
            <p className="text-gray-400 text-sm">Login Type</p>
            <p className="text-white text-lg font-medium">
              {userPhoto ? "Google Account" : "Email / Phone"}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 space-y-3">
          <button
            onClick={() => navigate("/my-bookings")}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg transition"
          >
            My Bookings
          </button>

          <button
            disabled
            className="w-full bg-gray-700 text-gray-400 py-2 rounded-lg cursor-not-allowed"
          >
            Edit Profile (Coming Soon)
          </button>

          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>

      </div>
    </div>
  )
}

export default Profile
