const Booking = require("../Models/Booking");
const Show = require("../Models/Show");
const Movie = require("../Models/Movie");
const razorpay = require("../config/razorpay");

// GET bookings for logged-in user
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.userId })
      .populate({
        path: "show",
        populate: { path: "movie" },
      })
      .populate({ path: "user", select: "email name" })
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};

exports.createRazorpayOrder = async (req, res) => {
  try {
    const { showId, bookedSeats } = req.body;

    if (!showId) {
      return res.status(400).json({ message: "showId is required" });
    }
    if (!Array.isArray(bookedSeats) || bookedSeats.length === 0) {
      return res.status(400).json({ message: "bookedSeats must be a non-empty array" });
    }

    const show = await Show.findById(showId);
    if (!show) {
      return res.status(404).json({ message: "Show not found" });
    }

    if (new Date(show.showDateTime) <= new Date()) {
      return res.status(400).json({ message: "Cannot book a show that has already started or ended" });
    }

    const occupiedSeats = show.occupiedSeats instanceof Map
      ? Object.fromEntries(show.occupiedSeats)
      : show.occupiedSeats || {};

    const duplicateSeat = bookedSeats.find((seat) => occupiedSeats[seat]);
    if (duplicateSeat) {
      return res.status(400).json({ message: `Seat ${duplicateSeat} is already booked` });
    }

    const amount = (show.showPrice || 0) * bookedSeats.length;
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
      notes: {
        seats: bookedSeats.join(", "),
      },
    });

    res.status(201).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
      showPrice: show.showPrice || 0,
      totalAmount: amount,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create payment order" });
  }
};

exports.createBooking = async (req, res) => {
  try {
    console.log("Create booking request:", req.body);
    const { showId, bookedSeats, customerName, customerEmail, customerPhone, paymentId } = req.body;

    if (!showId) {
      return res.status(400).json({ message: "showId is required" });
    }
    if (!Array.isArray(bookedSeats) || bookedSeats.length === 0) {
      return res.status(400).json({ message: "bookedSeats must be a non-empty array" });
    }
    if (!customerName || !customerEmail || !customerPhone) {
      return res.status(400).json({ message: "Customer details are required" });
    }
    if (!paymentId) {
      return res.status(400).json({ message: "Payment ID is required" });
    }

    console.log("Validation passed, fetching show:", showId);

    const show = await Show.findById(showId);
    if (!show) {
      console.log("Show not found:", showId);
      return res.status(404).json({ message: "Show not found" });
    }

    if (new Date(show.showDateTime) <= new Date()) {
      return res.status(400).json({ message: "Cannot book a show that has already started or ended" });
    }

    if (!(show.occupiedSeats instanceof Map)) {
      show.occupiedSeats = new Map(Object.entries(show.occupiedSeats || {}));
    }

    const occupiedSeats = Object.fromEntries(show.occupiedSeats);

    const duplicateSeat = bookedSeats.find((seat) => occupiedSeats[seat]);
    if (duplicateSeat) {
      console.log("Duplicate seat:", duplicateSeat);
      return res.status(400).json({ message: `Seat ${duplicateSeat} is already booked` });
    }

    console.log("Seats available, updating show");

    bookedSeats.forEach((seat) => {
      show.occupiedSeats.set(seat, "booked");
    });

    await show.save();

    const amount = (show.showPrice || 0) * bookedSeats.length;
    const booking = await Booking.create({
      user: req.userId,
      show: showId,
      bookedSeats,
      amount,
      customerName,
      customerEmail,
      customerPhone,
      paymentId,
      isPaid: true,
    });

    await Movie.findByIdAndUpdate(show.movie, {
      $inc: { vote_count: bookedSeats.length },
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: "Failed to create booking" });
  }
};

// GET all bookings (Admin)
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate({
        path: "show",
        populate: { path: "movie" },
      })
      .populate({ path: "user", select: "email name" })
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};
