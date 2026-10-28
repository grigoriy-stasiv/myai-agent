const express = require("express");
const router = express.Router();

const { register, login } = require("../controllers/authController");

router.post("/register", register);

router.post("/login", login);

const authMiddleware = require("../middleware/authMiddleware");

router.get("/me", authMiddleware, (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
    },
  });
});

module.exports = router;
