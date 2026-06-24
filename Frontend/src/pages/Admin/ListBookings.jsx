import React, { useEffect, useMemo, useState } from "react";
import { Loading } from "../../components/Loading";
import Title from "../../components/admin/Title";
import { dateFormat } from "../../lib/dateFormat";
import api from "../../api/api";
import { AlertCircle, RefreshCcw, Search, Ticket } from "lucide-react";

const Badge = ({ children }) => (
  <span className="inline-flex items-center rounded-full border border-gray-700 bg-gray-900/40 px-3 py-1 text-xs text-gray-300">
    {children}
  </span>
);

const ListBookings = () => {
  const currency = import.meta.env.VITE_CURRENCY;

  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // UI-only
  const [query, setQuery] = useState("");

  const getAllBookings = async () => {
    try {
      setError("");
      setIsLoading(true);
      const res = await api.get("/api/bookings");
      setBookings(res.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load bookings.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAllBookings();
  }, []);

  const filteredBookings = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return bookings;

    return bookings.filter((b) => {
      const user = (b.user?.name || b.user?.email || "").toLowerCase();
      const movie = (b.show?.movie?.title || "").toLowerCase();
      const seats = Array.isArray(b.bookedSeats) ? b.bookedSeats.join(", ").toLowerCase() : "";
      return user.includes(q) || movie.includes(q) || seats.includes(q);
    });
  }, [bookings, query]);

  if (isLoading) return <Loading />;

  return (
    <>
      <Title text1="List" text2="Bookings" />

      <div className="mt-6 max-w-6xl space-y-6">
        {/* Header card */}
        <div className="rounded-3xl border border-gray-800 bg-gradient-to-b from-gray-950/60 to-gray-950/30 p-6 md:p-7">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-100">
                All Bookings
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                View and search user bookings with seats, showtime, and amount.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge>
                <Ticket className="h-4 w-4 mr-2 text-gray-400" />
                Total: {bookings.length}
              </Badge>

              <button
                type="button"
                onClick={getAllBookings}
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
              placeholder="Search by user, movie, or seats..."
              className="w-full bg-transparent outline-none text-sm text-gray-200 placeholder:text-gray-600"
            />
            <Badge>Showing: {filteredBookings.length}</Badge>
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
                  <th className="p-3 font-medium">User</th>
                  <th className="p-3 font-medium">Movie</th>
                  <th className="p-3 font-medium">Show Time</th>
                  <th className="p-3 font-medium">Seats</th>
                  <th className="p-3 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((item, index) => (
                  <tr
                    key={item._id || index}
                    className="border-t border-gray-800 hover:bg-gray-950/60 transition"
                  >
                    <td className="p-3 min-w-[220px]">
                      <p className="font-medium text-gray-100">
                        {item.user?.name || item.user?.email || "-"}
                      </p>
                      {item.user?.email && item.user?.name ? (
                        <p className="text-xs text-gray-500">{item.user.email}</p>
                      ) : null}
                    </td>

                    <td className="p-3 min-w-[200px] font-medium text-gray-100">
                      {item.show?.movie?.title || "-"}
                    </td>

                    <td className="p-3 min-w-[220px]">
                      {item.show?.showDateTime ? dateFormat(item.show.showDateTime) : "-"}
                    </td>

                    <td className="p-3 min-w-[240px]">
                      {Array.isArray(item.bookedSeats) && item.bookedSeats.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {item.bookedSeats.slice(0, 8).map((s) => (
                            <span
                              key={s}
                              className="rounded-full border border-gray-700 bg-gray-900/40 px-3 py-1 text-xs text-gray-300"
                            >
                              {s}
                            </span>
                          ))}
                          {item.bookedSeats.length > 8 ? (
                            <span className="text-xs text-gray-500">
                              +{item.bookedSeats.length - 8} more
                            </span>
                          ) : null}
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>

                    <td className="p-3 font-semibold text-gray-100">
                      {currency}
                      {item.amount ?? "-"}
                    </td>
                  </tr>
                ))}

                {filteredBookings.length === 0 ? (
                  <tr>
                    <td className="p-3 text-gray-500" colSpan={5}>
                      No bookings found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default ListBookings;
