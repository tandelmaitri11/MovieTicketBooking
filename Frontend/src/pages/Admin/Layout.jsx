import React, { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { Outlet, useNavigate } from "react-router-dom";
import AdminNavbar from "../../components/admin/AdminNavbar";

const Layout = () => {
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  // UI-only: avoid blank flash while redirecting
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      navigate("/login");
      return;
    }
    setChecking(false);
  }, [isAdmin, navigate]);

  if (!isAdmin) return null;

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-gray-300 text-sm">Loading admin panel...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <AdminNavbar />

      <div className="flex">
        <AdminSidebar />

        {/* Main content */}
        <main className="flex-1 h-[calc(100vh-64px)] overflow-y-auto">
          <div className="px-4 py-8 md:px-10 md:py-10 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
