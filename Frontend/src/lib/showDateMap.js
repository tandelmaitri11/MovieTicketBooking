const buildShowDateMap = (shows = []) => {
  const dateMap = {};

  shows.forEach((show) => {
    if (!show?.showDateTime) return;
    const dt = new Date(show.showDateTime);
    const dateKey = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;

    if (!dateMap[dateKey]) dateMap[dateKey] = [];
    dateMap[dateKey].push({
      time: show.showDateTime,
      showId: show._id,
      showPrice: show.showPrice,
      occupiedSeats: show.occupiedSeats || {},
    });
  });

  Object.values(dateMap).forEach((items) => {
    items.sort((a, b) => new Date(a.time) - new Date(b.time));
  });

  return dateMap;
};

export default buildShowDateMap;
