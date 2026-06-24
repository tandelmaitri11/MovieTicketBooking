import { ChartLineIcon, CircleDollarSignIcon, PlayCircleIcon, User2Icon, Search, RefreshCcw, AlertCircle,} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { Loading } from "../../components/Loading";
import Title from "../../components/admin/Title";
import { dateFormat } from "../../lib/dateFormat";
import api from "../../api/api";

const StatCard = ({ title, value, icon: Icon, sub }) => (
  <div className="rounded-3xl border border-gray-800 bg-gradient-to-b from-gray-950/55 to-gray-950/25 p-5 shadow-sm">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm text-gray-400">{title}</p>
        <p className="mt-1 text-2xl font-semibold text-gray-100">{value}</p>
        {sub ? <p className="mt-1 text-xs text-gray-500">{sub}</p> : null}
      </div>
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-800 bg-gray-900/40">
        <Icon className="h-5 w-5 text-primary" />
      </div>
    </div>
  </div>
);

const SectionCard = ({ title, subtitle, right, children }) => (
  <section className="rounded-3xl border border-gray-800 bg-gray-950/40 p-6">
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-base font-semibold text-gray-100">{title}</p>
        {subtitle ? <p className="mt-1 text-sm text-gray-500">{subtitle}</p> : null}
      </div>
      {right ? <div className="flex items-center gap-2">{right}</div> : null}
    </div>
    <div className="mt-5">{children}</div>
  </section>
);

const Table = ({ columns, rows, emptyText }) => (
  <div className="overflow-x-auto rounded-2xl border border-gray-800">
    <table className="w-full text-sm text-gray-300">
      <thead>
        <tr className="text-left text-gray-400 bg-gray-950/60">
          {columns.map((c) => (
            <th key={c.key} className="p-3 font-medium">
              {c.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows}
        {!rows?.length ? (
          <tr>
            <td className="p-3 text-gray-500" colSpan={columns.length}>
              {emptyText}
            </td>
          </tr>
        ) : null}
      </tbody>
    </table>
  </div>
);

const Badge = ({ children }) => (
  <span className="inline-flex items-center rounded-full border border-gray-700 bg-gray-900/40 px-3 py-1 text-xs text-gray-300">
    {children}
  </span>
);

const Dashboard = () => {
  const currency = import.meta.env.VITE_CURRENCY;

  const [movies, setMovies] = useState([]);
  const [shows, setShows] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [usersCount, setUsersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // UI-only
  const [activeTab, setActiveTab] = useState("movies"); // "movies" | "shows" | "bookings"
  const [query, setQuery] = useState("");

  const totalRevenue = useMemo(
    () => bookings.reduce((sum, b) => sum + (b.amount || 0), 0),
    [bookings]
  );

  const dashboardCards = useMemo(
    () => [
      { title: "Total Bookings", value: String(bookings.length || 0), icon: ChartLineIcon },
      { title: "Total Revenue", value: `${currency}${totalRevenue || 0}`, icon: CircleDollarSignIcon },
      { title: "Active Shows", value: String(shows.length || 0), icon: PlayCircleIcon },
      { title: "Total Users", value: String(usersCount || 0), icon: User2Icon },
    ],
    [bookings.length, currency, totalRevenue, shows.length, usersCount]
  );

  const fetchDashboardData = async () => {
    setError("");
    setLoading(true);
    try {
      const [moviesRes, showsRes, bookingsRes, usersRes] = await Promise.all([
        api.get("/api/movies"),
        api.get("/api/shows"),
        api.get("/api/bookings"),
        api.get("/auth/users"),
      ]);
      setMovies(moviesRes.data || []);
      setShows(showsRes.data || []);
      setBookings(bookingsRes.data || []);
      setUsersCount(usersRes.data?.length || 0);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // UI-only filtering
  const filteredMovies = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return movies;
    return movies.filter((m) => (m.title || "").toLowerCase().includes(q));
  }, [movies, query]);

  const filteredShows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return shows;
    return shows.filter((s) => (s.movie?.title || "").toLowerCase().includes(q));
  }, [shows, query]);

  const filteredBookings = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return bookings;
    return bookings.filter((b) => {
      const email = (b.user?.email || "").toLowerCase();
      const title = (b.show?.movie?.title || "").toLowerCase();
      return email.includes(q) || title.includes(q);
    });
  }, [bookings, query]);

  if (loading) return <Loading />;

  return (
    <>
      <Title text1="Admin" text2="Dashboard" />

      <div className="mt-6 max-w-6xl space-y-6">
        {/* Header */}
        <div className="rounded-3xl border border-gray-800 bg-gradient-to-b from-gray-950/60 to-gray-950/30 p-6 md:p-7">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-100">
                Overview
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Quick stats + latest lists for movies, shows, and bookings.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge>Live data</Badge>
              <button
                type="button"
                onClick={fetchDashboardData}
                className="inline-flex items-center gap-2 rounded-2xl border border-gray-700 bg-gray-900/40 px-4 py-2 text-sm text-gray-200 hover:bg-gray-900/60 transition"
              >
                <RefreshCcw className="h-4 w-4" />
                Refresh
              </button>
            </div>
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

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {dashboardCards.map((card, idx) => (
            <StatCard key={idx} title={card.title} value={card.value} icon={card.icon} />
          ))}
        </div>

        {/* Tabs + Search */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="inline-flex rounded-2xl border border-gray-800 bg-gray-950/40 p-1">
            {[
              { key: "movies", label: `Movies (${movies.length})` },
              { key: "shows", label: `Shows (${shows.length})` },
              { key: "bookings", label: `Bookings (${bookings.length})` },
            ].map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key)}
                className={[
                  "px-4 py-2 text-sm rounded-xl transition",
                  activeTab === t.key
                    ? "bg-primary text-white"
                    : "text-gray-300 hover:bg-gray-900/40",
                ].join(" ")}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-gray-800 bg-gray-950/40 px-4 py-2.5">
            <Search className="h-4 w-4 text-gray-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                activeTab === "movies"
                  ? "Search movie title..."
                  : activeTab === "shows"
                  ? "Search show movie title..."
                  : "Search email or movie title..."
              }
              className="w-full bg-transparent outline-none text-sm text-gray-200 placeholder:text-gray-600"
            />
          </div>
        </div>

        {/* Content */}
        {activeTab === "movies" ? (
          <SectionCard
            title="Movies"
            subtitle="Latest movies currently in your system."
            right={<Badge>Showing: {filteredMovies.length}</Badge>}
          >
            <Table
              columns={[
                { key: "title", label: "Title" },
                { key: "release", label: "Release" },
                { key: "runtime", label: "Runtime" },
                { key: "lang", label: "Language" },
              ]}
              emptyText="No movies found."
              rows={filteredMovies.map((movie) => (
                <tr key={movie._id} className="border-t border-gray-800 hover:bg-gray-950/60 transition">
                  <td className="p-3 font-medium text-gray-100">{movie.title}</td>
                  <td className="p-3">{movie.release_date || "-"}</td>
                  <td className="p-3">{movie.runtime || "-"}</td>
                  <td className="p-3 uppercase">{movie.original_language || "-"}</td>
                </tr>
              ))}
            />
          </SectionCard>
        ) : null}

        {activeTab === "shows" ? (
          <SectionCard
            title="Shows"
            subtitle="All scheduled showtimes."
            right={<Badge>Showing: {filteredShows.length}</Badge>}
          >
            <Table
              columns={[
                { key: "movie", label: "Movie" },
                { key: "dt", label: "Date/Time" },
                { key: "price", label: "Price" },
              ]}
              emptyText="No shows found."
              rows={filteredShows.map((show) => (
                <tr key={show._id} className="border-t border-gray-800 hover:bg-gray-950/60 transition">
                  <td className="p-3 font-medium text-gray-100">{show.movie?.title || "-"}</td>
                  <td className="p-3">
                    {show.showDateTime ? dateFormat(show.showDateTime) : "-"}
                  </td>
                  <td className="p-3">
                    {currency}
                    {show.showPrice ?? "-"}
                  </td>
                </tr>
              ))}
            />
          </SectionCard>
        ) : null}

        {activeTab === "bookings" ? (
          <SectionCard
            title="Bookings"
            subtitle="Recent booking entries."
            right={<Badge>Showing: {filteredBookings.length}</Badge>}
          >
            <Table
              columns={[
                { key: "user", label: "User" },
                { key: "movie", label: "Movie" },
                { key: "amount", label: "Amount" },
                { key: "paid", label: "Paid" },
              ]}
              emptyText="No bookings found."
              rows={filteredBookings.map((booking) => (
                <tr
                  key={booking._id}
                  className="border-t border-gray-800 hover:bg-gray-950/60 transition"
                >
                  <td className="p-3">{booking.user?.email || "-"}</td>
                  <td className="p-3 font-medium text-gray-100">
                    {booking.show?.movie?.title || "-"}
                  </td>
                  <td className="p-3">
                    {currency}
                    {booking.amount ?? "-"}
                  </td>
                  <td className="p-3">
                    <span
                      className={[
                        "inline-flex rounded-full px-3 py-1 text-xs border",
                        booking.isPaid
                          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                          : "border-amber-500/20 bg-amber-500/10 text-amber-300",
                      ].join(" ")}
                    >
                      {booking.isPaid ? "Paid" : "Unpaid"}
                    </span>
                  </td>
                </tr>
              ))}
            />
          </SectionCard>
        ) : null}
      </div>
    </>
  );
};

export default Dashboard;
