const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/authMiddleware");

const {
  createStudio,
  getAllStudios,
  getFeaturedStudios,
  getStudioById,
  updateStudio,
  deleteStudio,
  getStudiosByOwner,
  addStudioReview,
} = require("../controllers/studioController");

router.get("/", getAllStudios);
router.get("/featured", getFeaturedStudios);

router.get("/owner/my-listings", verifyToken, getStudiosByOwner);
router.get("/owner/:email", verifyToken, getStudiosByOwner);

router.get("/:id", getStudioById);

router.post("/", verifyToken, createStudio);
router.put("/:id", verifyToken, updateStudio);
router.delete("/:id", verifyToken, deleteStudio);

router.post("/:id/reviews", verifyToken, addStudioReview);

module.exports = router;
