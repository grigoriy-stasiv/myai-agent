const express = require("express");
const router = express.Router();

const {
  getChats,
  createChat,
  getChatById,
  addMessage,
  deleteChat,
  renameChat,
} = require("../controllers/chatController");

const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, getChats);
router.post("/", authMiddleware, createChat);
router.get("/:id", authMiddleware, getChatById);
router.post("/:id/messages", authMiddleware, addMessage);
router.patch("/:id", authMiddleware, renameChat);
router.delete("/:id", authMiddleware, deleteChat);

module.exports = router;
