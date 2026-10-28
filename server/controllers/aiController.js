const OpenAI = require("openai");
const Chat = require("../models/Chat");
const mongoose = require("mongoose");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const sendMessage = async (req, res) => {
  try {
    const { message, chatId } = req.body;

    if (
      typeof message !== "string" ||
      !message.trim() ||
      message.trim().length > 4000
    ) {
      return res.status(400).json({
        message: "Повідомлення має містити від 1 до 4000 символів",
      });
    }
    if (chatId && !mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({
        message: "Некоректний ID чату",
      });
    }

    let chat;

    if (chatId) {
      chat = await Chat.findOne({
        _id: chatId,
        user: req.user._id,
      });

      if (!chat) {
        return res.status(404).json({
          message: "Чат не знайдено",
        });
      }
    } else {
      chat = new Chat({
        user: req.user._id,
        title: message.trim().slice(0, 40),
        messages: [],
      });
    }

    const conversationHistory = chat.messages
      .map((item) => ({
        role: item.role,
        content: item.content,
      }))
      .slice(-20);
    
    chat.messages.push({
      role: "user",
      content: message.trim(),
    });

    if (chat.title === "Нова розмова" && chat.messages.length === 1) {
      chat.title = message.trim().slice(0, 40);
    }

    await chat.save();

    let aiReply;

    if (process.env.MOCK_AI === "true") {
      aiReply = `Тестова відповідь MyAI Agent: я отримав твоє повідомлення — "${message.trim()}"`;
    } else {
      const response = await openai.responses.create({
        model: "gpt-6-astra",
        instructions:
          "Ти MyAI Agent — універсальний, дружній та корисний AI-помічник. Відповідай українською мовою, якщо користувач не просить іншу мову.",
        input: [
          ...conversationHistory,
          {
            role: "user",
            content: message.trim(),
          },
        ],
      });

      aiReply = response.output_text;
    }
    chat.messages.push({
      role: "assistant",
      content: aiReply,
    });
    await chat.save();

    res.json({
      reply: aiReply,
      chatId: chat._id,
    });
  } catch (error) {
    console.error("AI error:", error.message);

    res.status(500).json({
      message: "Не вдалося отримати відповідь від AI",
    });
  }
};

module.exports = { sendMessage };
