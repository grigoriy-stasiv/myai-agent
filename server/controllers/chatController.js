const Chat = require("../models/Chat");

const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      user: req.user._id,
    }).sort({ updatedAt: -1 });

    res.json(chats);
  } catch (error) {
    console.error("Get chats error:", error.message);

    res.status(500).json({
      message: "Не вдалося отримати історію розмов",
    });
  }
};

const createChat = async (req, res) => {
  try {
    const { title } = req.body;

    const chat = await Chat.create({
      title: title?.trim() || "Нова розмова",
      user: req.user._id,
      messages: [],
    });

    res.status(201).json(chat);
  } catch (error) {
    console.error("Create chat error:", error.message);

    res.status(500).json({
      message: "Не вдалося створити розмову",
    });
  }
};

const getChatById = async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!chat) {
      return res.status(404).json({
        message: "Розмову не знайдено",
      });
    }

    res.json(chat);
  } catch (error) {
    console.error("Get chat by ID error:", error.message);

    res.status(500).json({
      message: "Не вдалося отримати розмову",
    });
  }
};

const addMessage = async (req, res) => {
  try {
    const { content } = req.body;

    if (
      typeof content !== "string" ||
      !content.trim() ||
      content.trim().length > 4000
    ) {
      return res.status(400).json({
        message: "Повідомлення має містити від 1 до 4000 символів",
      });
    }

    const chat = await Chat.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!chat) {
      return res.status(404).json({
        message: "Розмову не знайдено",
      });
    }

    chat.messages.push({
      role: "user",
      content: content.trim(),
    });

    if (chat.title === "Нова розмова" && chat.messages.length === 1) {
      chat.title = content.trim().slice(0, 30);
    }

    await chat.save();

    res.status(201).json(chat);
  } catch (error) {
    console.error("Add message error:", error.message);

    res.status(500).json({
      message: "Не вдалося зберегти повідомлення",
    });
  }
};

const addAssistantMessage = async (req, res) => {
  try {
    const { content } = req.body;

    if (
      typeof content !== "string" ||
      !content.trim() ||
      content.trim().length > 10000
    ) {
      return res.status(400).json({
        message: "Відповідь AI має містити від 1 до 10000 символів",
      });
    }

    const chat = await Chat.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!chat) {
      return res.status(404).json({
        message: "Розмову не знайдено",
      });
    }

    chat.messages.push({
      role: "assistant",
      content: content.trim(),
    });

    await chat.save();

    res.status(201).json(chat);
  } catch (error) {
    console.error("Add assistant message error:", error.message);

    res.status(500).json({
      message: "Не вдалося зберегти відповідь AI",
    });
  }
};

const deleteChat = async (req, res) => {
  try {
    const chat = await Chat.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!chat) {
      return res.status(404).json({
        message: "Чат не знайдено",
      });
    }

    res.json({
      message: "Чат успішно видалено",
    });
  } catch (error) {
    console.error("Delete chat error:", error.message);

    res.status(500).json({
      message: "Не вдалося видалити чат",
    });
  }
};

module.exports = {
  getChats,
  createChat,
  getChatById,
  addMessage,
  addAssistantMessage,
  deleteChat,
};
