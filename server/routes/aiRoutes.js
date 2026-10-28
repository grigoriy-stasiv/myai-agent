
const express = require("express");
const router = express.Router();

const { sendMessage } = require("../controllers/aiController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/chat", authMiddleware, sendMessage);

module.exports = router;
