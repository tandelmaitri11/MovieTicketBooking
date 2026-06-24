import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { MenuIcon, SearchIcon, XIcon, ChevronDown } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("isAdmin");
    setDropdownOpen(false);
    navigate("/login");
  };

  const userEmail = localStorage.getItem("userEmail");

  const links = [
    { path: "/", label: "Home" },
    { path: "/movies", label: "Movies" },
    { path: "/", label: "Theaters" },
    { path: "/", label: "Releases" },
    { path: "/favorite", label: "Favorites" },
  ];

  return (
    <header className="fixed top-0 left-0 z-50 w-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 md:px-16 lg:px-36 py-4 bg-black/60 backdrop-blur border-b border-white/10 text-white">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0" onClick={() => window.scrollTo(0, 0)}>
          <img src={assets.logo} alt="logo" className="w-32 md:w-36 h-auto" />
        </Link>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.label}
              to={l.path}
              onClick={() => window.scrollTo(0, 0)}
              className="relative text-sm text-gray-200 hover:text-white transition group"
            >
              {l.label}
              <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-primary transition-all group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3 md:gap-6 relative">
          <button className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition">
            <SearchIcon className="w-5 h-5" />
          </button>

          {!userEmail ? (
            <Link to="/login">
              <button className="px-5 py-2 bg-primary hover:bg-primary-dull rounded-full text-sm font-medium transition shadow-md">
                Login
              </button>
            </Link>
          ) : (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-medium transition"
              >
                <span className="max-w-[140px] truncate">{userEmail}</span>
                <ChevronDown className={`w-4 h-4 transition ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-44 bg-black/90 backdrop-blur rounded-xl border border-white/10 shadow-2xl p-2 z-50">
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm text-gray-200 hover:bg-white/10 transition"
                  >
                    Profile
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 rounded-lg text-sm text-gray-200 hover:bg-red-600/80 transition"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition"
            onClick={() => setIsOpen(true)}
          >
            <MenuIcon className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition ${
          isOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          onClick={() => setIsOpen(false)}
          className={`absolute inset-0 bg-black/60 transition-opacity ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Panel */}
        <div
          className={`absolute top-0 right-0 h-full w-[78%] max-w-xs bg-black/90 backdrop-blur border-l border-white/10 shadow-2xl transition-transform duration-300 ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between p-5 border-b border-white/10">
            <p className="text-sm text-gray-200">Menu</p>
            <XIcon
              className="w-6 h-6 cursor-pointer"
              onClick={() => setIsOpen(false)}
            />
          </div>

          <div className="flex flex-col gap-2 p-5">
            {links.map((l) => (
              <Link
                key={l.label}
                to={l.path}
                onClick={() => {
                  window.scrollTo(0, 0);
                  setIsOpen(false);
                }}
                className="px-4 py-3 rounded-xl text-gray-200 hover:bg-white/10 transition"
              >
                {l.label}
              </Link>
            ))}

            <div className="mt-4 border-t border-white/10 pt-4">
              {!userEmail ? (
                <Link to="/login" onClick={() => setIsOpen(false)}>
                  <button className="w-full px-5 py-3 bg-primary hover:bg-primary-dull rounded-xl text-sm font-medium transition">
                    Login
                  </button>
                </Link>
              ) : (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-3 rounded-xl text-gray-200 hover:bg-white/10 transition"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-4 py-3 rounded-xl text-gray-200 hover:bg-red-600/80 transition"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
