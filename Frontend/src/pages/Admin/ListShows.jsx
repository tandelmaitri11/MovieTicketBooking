import React, { useEffect, useMemo, useState } from "react";
import { Loading } from "../../components/Loading";
import Title from "../../components/admin/Title";
import { dateFormat } from "../../lib/dateFormat";
import api from "../../api/api";
import { AlertCircle, RefreshCcw, Search, PlayCircle } from "lucide-react";

const Badge = ({ children }) => (
  <span className="inline-flex items-center rounded-full border border-gray-700 bg-gray-900/40 px-3 py-1 text-xs text-gray-300">
    {children}
  </span>
);

const ListShows = () => {
  const currency = import.meta.env.VITE_CURRENCY;

  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // UI-only
  const [query, setQuery] = useState("");

  const getAllShows = async () => {
    try {
      setError("");
      setLoading(true);
      const res = await api.get("/api/shows");
      setShows(res.data || []);
    } catch (error) {
      setError(error?.response?.data?.message || "Failed to load shows.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllShows();
  }, []);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = !q
      ? shows
      : shows.filter((s) => (s.movie?.title || "").toLowerCase().includes(q));

    return list.map((show) => {
      const bookingsCount = show.occupiedSeats ? Object.keys(show.occupiedSeats).length : 0;
      const earnings = bookingsCount * (show.showPrice || 0);
      return { show, bookingsCount, earnings };
    });
  }, [shows, query]);

  if (loading) return <Loading />;

  return (
    <>
      <Title text1="List" text2="Shows" />

      <div className="mt-6 max-w-6xl space-y-6">
        {/* Header */}
        <div className="rounded-3xl border border-gray-800 bg-gradient-to-b from-gray-950/60 to-gray-950/30 p-6 md:p-7">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-100">
                All Shows
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                View showtimes with total bookings and earnings.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge>
                <PlayCircle className="h-4 w-4 mr-2 text-gray-400" />
                Total: {shows.length}
              </Badge>

              <button
                type="button"
                onClick={getAllShows}
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
              placeholder="Search by movie title..."
              className="w-full bg-transparent outline-none text-sm text-gray-200 placeholder:text-gray-600"
            />
            <Badge>Showing: {rows.length}</Badge>
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
                  <th className="p-3 font-medium">Movie</th>
                  <th className="p-3 font-medium">Show Time</th>
                  <th className="p-3 font-medium">Total Bookings</th>
                  <th className="p-3 font-medium">Earnings</th>
                </tr>
              </thead>

              <tbody>
                {rows.map(({ show, bookingsCount, earnings }) => (
                  <tr
                    key={show._id}
                    className="border-t border-gray-800 hover:bg-gray-950/60 transition"
                  >
                    <td className="p-3 min-w-[260px] font-medium text-gray-100">
                      {show.movie?.title || "-"}
                    </td>

                    <td className="p-3 min-w-[240px]">
                      {show.showDateTime ? dateFormat(show.showDateTime) : "-"}
                    </td>

                    <td className="p-3">
                      <span className="inline-flex items-center rounded-full border border-gray-700 bg-gray-900/40 px-3 py-1 text-xs text-gray-200">
                        {bookingsCount}
                      </span>
                    </td>

                    <td className="p-3 font-semibold text-gray-100">
                      {currency} {earnings}
                    </td>
                  </tr>
                ))}

                {rows.length === 0 ? (
                  <tr>
                    <td className="p-3 text-gray-500" colSpan={4}>
                      No shows found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          {/* Small footer hint */}
          <p className="mt-3 text-xs text-gray-500">
            Earnings = total booked seats × show price.
          </p>
        </div>
      </div>
    </>
  );
};

export default ListShows;
