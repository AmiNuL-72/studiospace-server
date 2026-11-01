const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  googleLogin,
  logoutUser,
  getCurrentUser,
} = require("../controllers/authController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google-login", googleLogin);

router.post("/logout", logoutUser);
router.get("/me", verifyToken, getCurrentUser);

module.exports = router;
