const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/authMiddleware");

const {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatusOrCancel,
} = require("../controllers/bookingController");

router.post("/", verifyToken, createBooking);
router.get("/", verifyToken, getMyBookings);
router.get("/my-bookings", verifyToken, getMyBookings);
router.get("/:id", verifyToken, getBookingById);
router.patch("/:id", verifyToken, updateBookingStatusOrCancel);
router.patch("/:id/cancel", verifyToken, updateBookingStatusOrCancel);
router.patch("/:id/status", verifyToken, updateBookingStatusOrCancel);

module.exports = router;
