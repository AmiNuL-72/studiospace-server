const Wishlist = require("../models/Wishlist");
const Studio = require("../models/Studio");

const addToWishlist = async (req, res) => {
  try {
    const { studioId } = req.body;
    const userEmail = req.user.email;

    if (!studioId) {
      return res.status(400).json({
        success: false,
        message: "Studio ID is required",
      });
    }

    const studio = await Studio.findById(studioId);
    if (!studio) {
      return res.status(404).json({
        success: false,
        message: "Studio not found",
      });
    }

    const existing = await Wishlist.findOne({ userEmail, studioId });
    if (existing) {
      return res.status(200).json({
        success: true,
        message: "Studio is already in your wishlist",
        data: existing,
      });
    }

    const wishlistItem = await Wishlist.create({
      userEmail,
      studioId,
    });

    res.status(201).json({
      success: true,
      message: "Studio saved to wishlist",
      data: wishlistItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getWishlist = async (req, res) => {
  try {
    const email = req.query.email || req.user.email;

    const items = await Wishlist.find({ userEmail: email })
      .sort({ createdAt: -1 })
      .populate("studioId");

    const studios = items
      .map((item) => item.studioId)
      .filter((studio) => studio !== null);

    res.status(200).json({
      success: true,
      count: studios.length,
      studios,
      data: studios,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const { id } = req.params;
    const userEmail = req.user.email;

    await Wishlist.findOneAndDelete({
      userEmail,
      $or: [{ studioId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    res.status(200).json({
      success: true,
      message: "Studio removed from wishlist",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
};
