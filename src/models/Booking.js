const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    studioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Studio",
      required: true,
    },
    studioTitle: {
      type: String,
      required: true,
    },
    studioImage: {
      type: String,
      default: "",
    },
    userEmail: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    bookingDate: {
      type: String,
      default: "",
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    totalHours: {
      type: Number,
      required: true,
      min: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    securityDeposit: {
      type: Number,
      default: 0,
    },
    specialRequests: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Completed", "Cancelled"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.pre("save", function () {
  if (this.date && !this.bookingDate) {
    this.bookingDate = this.date;
  } else if (this.bookingDate && !this.date) {
    this.date = this.bookingDate;
  }
  if (this.totalPrice && !this.totalAmount) {
    this.totalAmount = this.totalPrice;
  } else if (this.totalAmount && !this.totalPrice) {
    this.totalPrice = this.totalAmount;
  }
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
