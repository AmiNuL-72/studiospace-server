const Studio = require("../models/Studio");

const createStudio = async (req, res) => {
  try {
    const {
      title,
      category,
      hourlyRate,
      securityDeposit,
      maxCapacity,
      location,
      image,
      primaryImage,
      images,
      amenities,
      overview,
      host,
    } = req.body;

    const img = primaryImage || image || (images && images[0]) || "";
    const allImages = images && images.length > 0 ? images : [img];

    const studio = await Studio.create({
      title,
      category,
      hourlyRate: Number(hourlyRate),
      securityDeposit: Number(securityDeposit) || 0,
      maxCapacity: Number(maxCapacity) || 1,
      location,
      image: img,
      primaryImage: img,
      images: allImages,
      amenities: amenities || [],
      overview,
      ownerEmail: req.user.email,
      ownerName: req.user.name,
      host: {
        name: host?.name || req.user.name,
        email: host?.email || req.user.email,
        avatar: host?.avatar || req.user.photo || "",
        phone: host?.phone || "",
      },
    });

    res.status(201).json({
      success: true,
      message: "Studio added successfully",
      ...studio.toObject(),
      data: studio,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllStudios = async (req, res) => {
  try {
    const { category, search, sort, sortBy, limit } = req.query;
    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    let sortOption = { createdAt: -1 };
    const sortKey = sortBy || sort;
    if (sortKey === "price_low" || sortKey === "price-asc") sortOption = { hourlyRate: 1 };
    if (sortKey === "price_high" || sortKey === "price-desc") sortOption = { hourlyRate: -1 };
    if (sortKey === "rating") sortOption = { rating: -1, createdAt: -1 };
    if (sortKey === "newest") sortOption = { createdAt: -1 };

    let query = Studio.find(filter).sort(sortOption);

    if (limit) {
      query = query.limit(parseInt(limit, 10));
    }

    const studios = await query;

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

const getFeaturedStudios = async (req, res) => {
  try {
    const studios = await Studio.find()
      .sort({ rating: -1, createdAt: -1 })
      .limit(6);

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

const getStudioById = async (req, res) => {
  try {
    const studio = await Studio.findById(req.params.id);
    if (!studio) {
      return res.status(404).json({
        success: false,
        message: "Studio not found",
      });
    }

    res.status(200).json({
      success: true,
      ...studio.toObject(),
      data: studio,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateStudio = async (req, res) => {
  try {
    const studio = await Studio.findById(req.params.id);

    if (!studio) {
      return res.status(404).json({
        success: false,
        message: "Studio not found",
      });
    }

    if (studio.ownerEmail !== req.user.email) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You can only update your own studios",
      });
    }

    const updateData = { ...req.body };
    delete updateData.ownerEmail;
    delete updateData.ownerName;

    if (updateData.primaryImage && !updateData.image) {
      updateData.image = updateData.primaryImage;
    }
    if (updateData.image && !updateData.primaryImage) {
      updateData.primaryImage = updateData.image;
    }
    if (updateData.primaryImage && (!updateData.images || updateData.images.length === 0)) {
      updateData.images = [updateData.primaryImage];
    }

    const updatedStudio = await Studio.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Studio updated successfully",
      ...updatedStudio.toObject(),
      data: updatedStudio,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteStudio = async (req, res) => {
  try {
    const studio = await Studio.findById(req.params.id);

    if (!studio) {
      return res.status(404).json({
        success: false,
        message: "Studio not found",
      });
    }

    if (studio.ownerEmail !== req.user.email) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You can only delete your own studios",
      });
    }

    await Studio.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Studio deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getStudiosByOwner = async (req, res) => {
  try {
    const email = req.params.email || req.query.email || req.user?.email;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Owner email is required",
      });
    }

    const studios = await Studio.find({ ownerEmail: email }).sort({
      createdAt: -1,
    });

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

const addStudioReview = async (req, res) => {
  try {
    const { rating, comment, userName, userAvatar } = req.body;
    const studio = await Studio.findById(req.params.id);

    if (!studio) {
      return res.status(404).json({
        success: false,
        message: "Studio not found",
      });
    }

    const newReview = {
      userId: req.user._id.toString(),
      userName: userName || req.user.name,
      userAvatar: userAvatar || req.user.photo || "",
      rating: Number(rating) || 5,
      comment: comment || "",
    };

    studio.reviews.push(newReview);
    studio.totalReviews = studio.reviews.length;

    const totalRatingSum = studio.reviews.reduce((acc, item) => acc + item.rating, 0);
    studio.rating = parseFloat((totalRatingSum / studio.reviews.length).toFixed(1));

    await studio.save();

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      ...studio.toObject(),
      data: studio,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createStudio,
  getAllStudios,
  getFeaturedStudios,
  getStudioById,
  updateStudio,
  deleteStudio,
  getStudiosByOwner,
  addStudioReview,
};
