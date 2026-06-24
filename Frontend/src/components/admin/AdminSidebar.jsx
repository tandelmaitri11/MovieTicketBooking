import React, { useEffect, useMemo, useState } from "react";
import { assets } from "../../assets/assets";
import {
  FilmIcon,
  LayoutDashboardIcon,
  LinkIcon,
  ListCollapseIcon,
  ListIcon,
  LogOutIcon,
  PlusSquareIcon,
  User2Icon,
  UsersIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import api from "../../api/api";

const AdminSidebar = () => {
  const navigate = useNavigate();

  const [adminName, setAdminName] = useState("Admin");
  const adminEmail = localStorage.getItem("userEmail") || "";
  const userPhoto = localStorage.getItem("userPhoto") || assets.profile;

  // UI-only
  const [collapsed, setCollapsed] = useState(false);

  const user = useMemo(
    () => ({
      firstName: adminName,
      lastName: "",
      imageurl: userPhoto,
    }),
    [adminName, userPhoto]
  );

  const adminNavlinks = useMemo(
    () => [
      { name: "Dashboard", path: "/admin", icon: LayoutDashboardIcon },
      { name: "Add Movie", path: "/admin/add-movie", icon: FilmIcon },
      { name: "Add Shows", path: "/admin/add-shows", icon: PlusSquareIcon },
      { name: "Upload Trailer", path: "/admin/add-trailer", icon: LinkIcon },
      { name: "Manage Users", path: "/admin/manage-users", icon: UsersIcon },
      { name: "List Shows", path: "/admin/list-shows", icon: ListIcon },
      { name: "List Bookings", path: "/admin/list-bookings", icon: ListCollapseIcon },
      { name: "Profile", path: "/admin/profile", icon: User2Icon },
    ],
    []
  );

  useEffect(() => {
    const loadAdmin = async () => {
      try {
        const res = await api.get("/auth/me");
        if (res.data?.name) setAdminName(res.data.name);
      } catch (err) {
        // keep default name
      }
    };
    loadAdmin();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userPhoto");
    localStorage.removeItem("isAdmin");
    navigate("/login");
  };

  return (
    <aside
      className={[
        "h-[calc(100vh-64px)] border-r border-gray-300/10",
        "bg-gradient-to-b from-gray-950/50 to-gray-950/20",
        "flex flex-col",
        collapsed ? "w-[72px]" : "w-full max-w-60",
      ].join(" ")}
    >
      {/* Top header */}
      <div className="relative px-4 pt-7 pb-5">
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className={[
            "absolute -right-3 top-7 hidden md:flex items-center justify-center",
            "h-8 w-8 rounded-2xl border border-gray-800 bg-gray-950/80",
            "text-gray-300 hover:text-white hover:border-gray-700 transition",
          ].join(" ")}
          aria-label="Toggle sidebar"
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>

        <div className="flex items-center gap-3">
          <img
            className={[
              "rounded-2xl object-cover border border-gray-800",
              collapsed ? "h-10 w-10" : "h-12 w-12",
            ].join(" ")}
            src={user.imageurl}
            alt="admin"
          />

          {!collapsed ? (
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-100 truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate">{adminEmail}</p>
            </div>
          ) : null}
        </div>

        {!collapsed ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full border border-gray-800 bg-gray-900/30 px-3 py-1 text-xs text-gray-300">
              Admin Panel
            </span>
            <span className="inline-flex items-center rounded-full border border-gray-800 bg-gray-900/30 px-3 py-1 text-xs text-gray-300">
              Quick Access
            </span>
          </div>
        ) : null}
      </div>

      {/* Nav */}
      <nav className="px-2 md:px-3 pb-3">
        <div className="space-y-1">
          {adminNavlinks.map((link, index) => (
            <NavLink
              key={index}
              to={link.path}
              end
              className={({ isActive }) =>
                [
                  "group relative flex items-center gap-3 rounded-2xl",
                  "px-3 py-2.5 transition",
                  isActive
                    ? "bg-primary/12 text-primary border border-primary/20"
                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-900/30 border border-transparent",
                ].join(" ")
              }
              title={collapsed ? link.name : undefined}
            >
              {({ isActive }) => (
                <>
                  <div
                    className={[
                      "flex h-9 w-9 items-center justify-center rounded-xl",
                      isActive
                        ? "bg-primary/15 border border-primary/25"
                        : "bg-gray-900/25 border border-gray-800",
                    ].join(" ")}
                  >
                    <link.icon className="h-5 w-5" />
                  </div>

                  {!collapsed ? (
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{link.name}</p>
                      <p className="text-[11px] text-gray-500 truncate">
                        {link.name === "Dashboard"
                          ? "Stats & overview"
                          : link.name === "Add Movie"
                          ? "Create a new movie"
                          : link.name === "Add Shows"
                          ? "Schedule showtimes"
                          : link.name === "Upload Trailer"
                          ? "Video & thumbnail"
                          : link.name === "Manage Users"
                          ? "Users list"
                          : link.name === "Profile"
                          ? "Admin profile"
                          : link.name === "List Shows"
                          ? "All shows"
                          : "All bookings"}
                      </p>
                    </div>
                  ) : null}

                  {/* Active indicator */}
                  <span
                    className={[
                      "absolute right-2 h-2 w-2 rounded-full transition",
                      isActive ? "bg-primary" : "bg-transparent",
                    ].join(" ")}
                  />
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Bottom actions */}
      <div className="mt-auto px-2 md:px-3 pb-6">
        <button
          onClick={handleLogout}
          className={[
            "w-full group flex items-center gap-3 rounded-2xl px-3 py-2.5 transition",
            "text-gray-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20",
          ].join(" ")}
          type="button"
          title={collapsed ? "Logout" : undefined}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900/25 border border-gray-800 group-hover:border-red-500/30">
            <LogOutIcon className="h-5 w-5" />
          </div>
          {!collapsed ? <p className="text-sm font-medium">Logout</p> : null}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
