const Booking = require("../models/Booking");
const Studio = require("../models/Studio");

const createBooking = async (req, res) => {
  try {
    const {
      studioId,
      date,
      bookingDate,
      startTime,
      endTime,
      totalHours,
      totalAmount,
      totalPrice,
      securityDeposit,
      specialRequests,
      studioImage,
    } = req.body;

    const reservationDate = date || bookingDate;

    if (!studioId || !reservationDate || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Studio ID, date, start time, and end time are required",
      });
    }

    const studio = await Studio.findById(studioId);
    if (!studio) {
      return res.status(404).json({
        success: false,
        message: "Studio not found",
      });
    }

    if (studio.ownerEmail === req.user.email) {
      return res.status(400).json({
        success: false,
        message: "You cannot book your own studio",
      });
    }

    const start = parseInt(startTime.split(":")[0]) * 60 + parseInt(startTime.split(":")[1]);
    const end = parseInt(endTime.split(":")[0]) * 60 + parseInt(endTime.split(":")[1]);
    const totalMinutes = end - start;

    if (totalMinutes <= 0) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time",
      });
    }

    const calculatedHours = totalHours || Math.ceil(totalMinutes / 60);
    const calculatedPrice = totalAmount || totalPrice || calculatedHours * studio.hourlyRate;

    const overlappingBooking = await Booking.findOne({
      studioId,
      $or: [{ date: reservationDate }, { bookingDate: reservationDate }],
      status: { $in: ["Confirmed", "Pending"] },
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });

    if (overlappingBooking) {
      return res.status(409).json({
        success: false,
        message: `This studio is already reserved on ${reservationDate} from ${overlappingBooking.startTime} to ${overlappingBooking.endTime}. Please choose a different time slot.`,
      });
    }

    const booking = await Booking.create({
      studioId,
      studioTitle: studio.title,
      studioImage: studioImage || studio.primaryImage || studio.image || "",
      userEmail: req.user.email,
      userName: req.user.name,
      date: reservationDate,
      bookingDate: reservationDate,
      startTime,
      endTime,
      totalHours: calculatedHours,
      totalPrice: calculatedPrice,
      totalAmount: calculatedPrice,
      securityDeposit: securityDeposit || studio.securityDeposit || 0,
      specialRequests: specialRequests || "",
      status: "Pending",
    });

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      ...booking.toObject(),
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const email = req.query.email || req.user.email;
    const bookings = await Booking.find({ userEmail: email })
      .sort({ createdAt: -1 })
      .populate("studioId", "title image primaryImage category location hourlyRate securityDeposit");

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate(
      "studioId",
      "title image primaryImage category location hourlyRate ownerName ownerEmail"
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.userEmail !== req.user.email && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You can only view your own bookings",
      });
    }

    res.status(200).json({
      success: true,
      ...booking.toObject(),
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateBookingStatusOrCancel = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (!status || status === "Cancelled") {
      if (booking.userEmail !== req.user.email) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You can only cancel your own bookings",
        });
      }

      if (booking.status !== "Pending") {
        return res.status(400).json({
          success: false,
          message: `Cannot cancel a booking with status: ${booking.status}. Only Pending bookings can be cancelled.`,
        });
      }

      booking.status = "Cancelled";
      await booking.save();

      return res.status(200).json({
        success: true,
        message: "Booking cancelled successfully",
        ...booking.toObject(),
        data: booking,
      });
    }

    const studio = await Studio.findById(booking.studioId);
    if (!studio || studio.ownerEmail !== req.user.email) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only the studio owner can confirm or complete bookings",
      });
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({
      success: true,
      message: `Booking status updated to ${status}`,
      ...booking.toObject(),
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatusOrCancel,
};
