const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    userAvatar: { type: String, default: "" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const studioSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Photo Studio",
        "Film Stage",
        "Podcast Lounge",
        "Music Suite",
        "Workshop",
        "Art Workshop",
        "Sound Stage",
      ],
    },
    hourlyRate: {
      type: Number,
      required: true,
      min: 0,
    },
    securityDeposit: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxCapacity: {
      type: Number,
      required: true,
      min: 1,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: "",
    },
    primaryImage: {
      type: String,
      default: "",
    },
    images: {
      type: [String],
      default: [],
    },
    amenities: {
      type: [String],
      default: [],
    },
    overview: {
      type: String,
      required: true,
    },
    ownerEmail: {
      type: String,
      required: true,
    },
    ownerName: {
      type: String,
      default: "",
    },
    host: {
      name: { type: String, default: "" },
      email: { type: String, default: "" },
      avatar: { type: String, default: "" },
      phone: { type: String, default: "" },
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    reviews: {
      type: [reviewSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

studioSchema.pre("save", function () {
  if (this.primaryImage && !this.image) {
    this.image = this.primaryImage;
  } else if (this.image && !this.primaryImage) {
    this.primaryImage = this.image;
  }
  if (!this.images || this.images.length === 0) {
    if (this.primaryImage) this.images = [this.primaryImage];
  }
});

const Studio = mongoose.model("Studio", studioSchema);

module.exports = Studio;
