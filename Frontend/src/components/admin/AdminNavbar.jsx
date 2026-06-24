import React from "react";
import { Link } from "react-router-dom";
import { assets } from "../../assets/assets";

const AdminNavbar = () => {
  return (
    <header className="sticky top-0 z-30 h-16 border-b border-gray-300/20 bg-gradient-to-r from-gray-950/70 to-gray-950/40 backdrop-blur">
      <div className="flex h-full items-center justify-between px-6 md:px-10">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <img
            src={assets.logo}
            alt="logo"
            className="w-32 md:w-36 h-auto"
          />
          <span className="hidden md:inline-flex text-xs px-2 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary">
            Admin Panel
          </span>
        </Link>

        {/* Right side (future actions) */}
        <div className="flex items-center gap-3 text-sm text-gray-400">
          {/* placeholder for notifications / profile */}
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
