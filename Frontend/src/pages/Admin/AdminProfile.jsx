import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/api";
import Title from "../../components/admin/Title";
import { Loading } from "../../components/Loading";
import {
  Camera,
  CheckCircle2,
  KeyRound,
  Mail,
  Phone,
  ShieldCheck,
  Upload,
  User,
  XCircle,
} from "lucide-react";

const Field = ({ label, icon: Icon, children, hint }) => (
  <div className="space-y-2">
    <div className="flex items-end justify-between gap-3">
      <label className="text-sm font-medium text-gray-200">{label}</label>
      {hint ? <span className="text-xs text-gray-500">{hint}</span> : null}
    </div>
    <div className="relative">
      {Icon ? (
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
          <Icon className="h-4 w-4 text-gray-500" />
        </div>
      ) : null}
      {children}
    </div>
  </div>
);

const Input = ({ icon: Icon, className = "", ...props }) => (
  <input
    {...props}
    className={[
      "w-full rounded-2xl border border-gray-800 bg-gray-950/60 px-4 py-3 text-sm text-gray-200",
      Icon ? "pl-10" : "",
      "placeholder:text-gray-600",
      "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition",
      className,
    ].join(" ")}
  />
);

const Badge = ({ children, tone = "neutral" }) => (
  <span
    className={[
      "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs",
      tone === "success"
        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
        : tone === "danger"
        ? "border-red-500/20 bg-red-500/10 text-red-300"
        : tone === "primary"
        ? "border-primary/25 bg-primary/10 text-primary"
        : "border-gray-700 bg-gray-900/40 text-gray-300",
    ].join(" ")}
  >
    {children}
  </span>
);

const AdminProfile = () => {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.get("/auth/me");
        setProfile(res.data);
        setForm({
          name: res.data?.name || "",
          phone: res.data?.phone || "",
        });
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await api.put("/auth/me", form);
      setProfile(res.data);
      setSuccess("Profile updated.");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setError("");
    setSuccess("");
    try {
      const formData = new FormData();
      formData.append("avatar", selectedFile);
      const res = await api.post("/auth/me/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfile(res.data);
      setSelectedFile(null);
      setSuccess("Photo updated.");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to upload photo.");
    } finally {
      setUploading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    setPasswordSaving(true);
    setError("");
    setSuccess("");
    try {
      await api.put("/auth/me/password", passwordForm);
      setPasswordForm({ currentPassword: "", newPassword: "" });
      setSuccess("Password updated.");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update password.");
    } finally {
      setPasswordSaving(false);
    }
  };

  const photoUrl = useMemo(() => {
    if (!profile?.profilePic) return "";
    if (profile.profilePic.startsWith("http")) return profile.profilePic;
    const baseUrl = api.defaults.baseURL || "";
    return `${baseUrl}${profile.profilePic}`;
  }, [profile]);

  const fallbackAvatar = useMemo(() => {
    const name = profile?.name || "Admin";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=111827&color=fff`;
  }, [profile]);

  if (loading) return <Loading />;

  return (
    <>
      <Title text1="Admin" text2="Profile" />

      <div className="mt-8 max-w-6xl">
        {/* Header card */}
        <div className="rounded-3xl border border-gray-800 bg-gradient-to-b from-gray-950/60 to-gray-950/30 p-6 md:p-7">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-100">
                Account Settings
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Update profile details, photo, and password.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge tone="primary">
                <ShieldCheck className="h-4 w-4" />
                {profile?.isAdmin ? "Admin" : "User"}
              </Badge>
              <Badge>
                <Mail className="h-4 w-4" />
                {profile?.email || "N/A"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Content grid */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left: Profile summary */}
          <div className="rounded-3xl border border-gray-800 bg-gray-950/40 p-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={photoUrl || fallbackAvatar}
                  alt="Admin"
                  className="h-16 w-16 rounded-2xl border border-gray-800 object-cover"
                />
                <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-xl border border-gray-800 bg-gray-950/80">
                  <Camera className="h-3.5 w-3.5 text-gray-300" />
                </span>
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-100 truncate">
                  {profile?.name || "Admin"}
                </p>
                <p className="text-xs text-gray-500 truncate">{profile?.email || "N/A"}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge tone="primary">{profile?.isAdmin ? "Admin" : "User"}</Badge>
                </div>
              </div>
            </div>

            {/* Upload */}
            <div className="mt-6 rounded-3xl border border-gray-800 bg-gray-950/50 p-5">
              <p className="text-sm font-semibold text-gray-100">Profile Photo</p>
              <p className="mt-1 text-xs text-gray-500">
                Upload a new avatar (JPG/PNG/WebP).
              </p>

              <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-700 bg-gray-950/30 px-4 py-4 text-sm text-gray-300 hover:border-primary/50 hover:bg-gray-950/60 transition">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
                <Upload className="h-4 w-4" />
                <span className="font-medium">
                  {selectedFile ? "Change file" : "Choose file"}
                </span>
                {selectedFile ? (
                  <span className="truncate max-w-[60%] text-xs text-gray-500">
                    {selectedFile.name}
                  </span>
                ) : null}
              </label>

              <button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-700 bg-gray-900/40 px-5 py-3 text-sm font-semibold text-gray-100 hover:bg-gray-900/60 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {uploading ? "Uploading..." : "Upload Photo"}
              </button>
            </div>
          </div>

          {/* Middle: Profile form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl border border-gray-800 bg-gray-950/40 p-6">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-gray-100">Profile Info</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Update name and phone number.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Name" icon={User}>
                  <Input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Admin name"
                    icon={User}
                    className="pl-10"
                  />
                </Field>

                <Field label="Phone" icon={Phone} hint="Optional">
                  <Input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="Phone number"
                    icon={Phone}
                    className="pl-10"
                  />
                </Field>
              </div>

              {/* Messages */}
              <div className="mt-5 space-y-3">
                {error ? (
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                    <div className="flex items-start gap-2">
                      <XCircle className="mt-0.5 h-4 w-4 text-red-300" />
                      <p className="text-sm text-red-300">{error}</p>
                    </div>
                  </div>
                ) : null}

                {success ? (
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />
                      <p className="text-sm text-emerald-300">{success}</p>
                    </div>
                  </div>
                ) : null}
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="mt-5 inline-flex w-full md:w-auto items-center justify-center rounded-2xl bg-primary px-7 py-3 text-sm font-semibold text-white hover:bg-primary/90 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>

            {/* Password */}
            <div className="rounded-3xl border border-gray-800 bg-gray-950/40 p-6">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-gray-100">Security</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Change your password to keep your account secure.
                  </p>
                </div>
                <KeyRound className="h-5 w-5 text-gray-500" />
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Current Password">
                  <Input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        currentPassword: e.target.value,
                      })
                    }
                    placeholder="Current password"
                  />
                </Field>

                <Field label="New Password">
                  <Input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value,
                      })
                    }
                    placeholder="New password"
                  />
                </Field>
              </div>

              <button
                onClick={handlePasswordUpdate}
                disabled={passwordSaving}
                className="mt-5 inline-flex w-full md:w-auto items-center justify-center rounded-2xl border border-gray-700 bg-gray-900/40 px-7 py-3 text-sm font-semibold text-gray-100 hover:bg-gray-900/60 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {passwordSaving ? "Updating..." : "Update Password"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminProfile;
