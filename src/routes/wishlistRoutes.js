const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/authMiddleware");

const {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} = require("../controllers/wishlistController");

router.post("/", verifyToken, addToWishlist);
router.get("/", verifyToken, getWishlist);
router.delete("/:id", verifyToken, removeFromWishlist);

module.exports = router;
