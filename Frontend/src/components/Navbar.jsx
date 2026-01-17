import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { MenuIcon, SearchIcon, XIcon, ChevronDown } from 'lucide-react'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("userEmail")
    setDropdownOpen(false)
    navigate("/login")
  }

  // Read email directly from localStorage
  const userEmail = localStorage.getItem("userEmail")

  return (
    <header className="fixed top-0 left-0 z-50 w-full flex items-center justify-between px-6 md:px-16 lg:px-36 py-5 bg-black text-white">
      
      {/* Logo */}
      <Link to="/" className="flex-shrink-0">
        <img src={assets.logo} alt="logo" className="w-36 h-auto" />
      </Link>

      {/* Menu Links */}
      <nav
        className={`fixed top-0 left-0 z-40 flex flex-col md:flex-row items-center justify-center gap-8 bg-black/70 md:bg-transparent md:static md:gap-6 w-full md:w-auto h-full md:h-auto transition-all duration-300 overflow-hidden ${isOpen ? 'w-full' : 'w-0 md:w-auto'}`}
      >
        <XIcon
          className="md:hidden absolute top-6 right-6 w-6 h-6 cursor-pointer"
          onClick={() => setIsOpen(false)}
        />
        {['/', '/movies', '/', '/', '/favorite'].map((path, idx) => {
          const labels = ['Home', 'Movies', 'Theaters', 'Releases', 'Favorites']
          return (
            <Link
              key={idx}
              to={path}
              onClick={() => { scrollTo(0, 0); setIsOpen(false) }}
              className="hover:text-primary transition"
            >
              {labels[idx]}
            </Link>
          )
        })}
      </nav>

      {/* Right Side Buttons */}
      <div className="flex items-center gap-4 md:gap-8 relative">
        <SearchIcon className="hidden md:block w-6 h-6 cursor-pointer" />

        {!userEmail ? (
          <Link to="/login">
            <button className="px-4 py-1 sm:px-7 sm:py-2 bg-primary hover:bg-primary-dull rounded-full font-medium transition">
              Login
            </button>
          </Link>
        ) : (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-4 py-1 bg-primary hover:bg-primary-dull rounded-full font-medium transition"
            >
              {userEmail} <ChevronDown className="w-4 h-4" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-gray-800 rounded-lg shadow-lg py-2 z-50">
                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="block px-4 py-2 text-gray-200 hover:bg-gray-700 rounded-lg"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-gray-200 hover:bg-red-600 rounded-lg"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile menu toggle */}
      <MenuIcon
        className="md:hidden w-8 h-8 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      />
    </header>
  )
}

export default Navbar
