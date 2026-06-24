import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/api";
import Title from "../../components/admin/Title";
import { Loading } from "../../components/Loading";
import {
  AlertCircle,
  RefreshCcw,
  Search,
  Trash2,
  Users,
  Mail,
  Phone,
  User as UserIcon,
} from "lucide-react";

const Badge = ({ children, tone = "neutral" }) => (
  <span
    className={[
      "inline-flex items-center rounded-full border px-3 py-1 text-xs",
      tone === "danger"
        ? "border-red-500/20 bg-red-500/10 text-red-300"
        : "border-gray-700 bg-gray-900/40 text-gray-300",
    ].join(" ")}
  >
    {children}
  </span>
);

const IconCell = ({ icon: Icon, text, sub }) => (
  <div className="flex items-start gap-2">
    <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl border border-gray-800 bg-gray-900/30">
      <Icon className="h-4 w-4 text-gray-400" />
    </div>
    <div className="min-w-0">
      <p className="truncate text-gray-100">{text || "-"}</p>
      {sub ? <p className="truncate text-xs text-gray-500">{sub}</p> : null}
    </div>
  </div>
);

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // UI-only
  const [query, setQuery] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const fetchUsers = async () => {
    try {
      setError("");
      setLoading(true);
      const res = await api.get("/auth/users");
      setUsers(res.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId) => {
    if (!userId) return;
    try {
      setError("");
      setDeletingId(userId);
      await api.delete(`/auth/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete user");
    } finally {
      setDeletingId("");
    }
  };

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const email = (u.email || "").toLowerCase();
      const name = (u.name || "").toLowerCase();
      const phone = (u.phone || "").toLowerCase();
      return email.includes(q) || name.includes(q) || phone.includes(q);
    });
  }, [users, query]);

  if (loading) return <Loading />;

  return (
    <>
      <Title text1="Manage" text2="Users" />

      <div className="mt-6 max-w-6xl space-y-6">
        {/* Header */}
        <div className="rounded-3xl border border-gray-800 bg-gradient-to-b from-gray-950/60 to-gray-950/30 p-6 md:p-7">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-100">
                Users
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Search users and remove accounts if needed.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge>
                <Users className="h-4 w-4 mr-2 text-gray-400" />
                Total: {users.length}
              </Badge>

              <button
                type="button"
                onClick={fetchUsers}
                className="inline-flex items-center gap-2 rounded-2xl border border-gray-700 bg-gray-900/40 px-4 py-2 text-sm text-gray-200 hover:bg-gray-900/60 transition"
              >
                <RefreshCcw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="mt-5 flex items-center gap-2 rounded-2xl border border-gray-800 bg-gray-950/50 px-4 py-3">
            <Search className="h-4 w-4 text-gray-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by email, name, or phone..."
              className="w-full bg-transparent outline-none text-sm text-gray-200 placeholder:text-gray-600"
            />
            <Badge>Showing: {filteredUsers.length}</Badge>
          </div>
        </div>

        {/* Error */}
        {error ? (
          <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-5">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-5 w-5 text-red-300" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          </div>
        ) : null}

        {/* Table */}
        <div className="rounded-3xl border border-gray-800 bg-gray-950/40 p-4 md:p-6">
          <div className="overflow-x-auto rounded-2xl border border-gray-800">
            <table className="w-full text-sm text-gray-300">
              <thead>
                <tr className="text-left text-gray-400 bg-gray-950/60">
                  <th className="p-3 font-medium">Email</th>
                  <th className="p-3 font-medium">Name</th>
                  <th className="p-3 font-medium">Phone</th>
                  <th className="p-3 font-medium text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="border-t border-gray-800 hover:bg-gray-950/60 transition"
                  >
                    <td className="p-3 min-w-[260px]">
                      <IconCell icon={Mail} text={user.email || "-"} />
                    </td>

                    <td className="p-3 min-w-[220px]">
                      <IconCell
                        icon={UserIcon}
                        text={user.name || "-"}
                        sub={user.isAdmin ? "Admin" : undefined}
                      />
                    </td>

                    <td className="p-3 min-w-[180px]">
                      <IconCell icon={Phone} text={user.phone || "-"} />
                    </td>

                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        disabled={deletingId === user._id}
                        type="button"
                        className={[
                          "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition",
                          "border border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-500/15",
                          "disabled:opacity-60 disabled:cursor-not-allowed",
                        ].join(" ")}
                      >
                        <Trash2 className="h-4 w-4" />
                        {deletingId === user._id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredUsers.length === 0 ? (
                  <tr>
                    <td className="p-3 text-gray-500" colSpan={4}>
                      No users found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-xs text-gray-500">
            Tip: Use search to quickly find a user by email.
          </p>
        </div>
      </div>
    </>
  );
};

export default ManageUsers;
