
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const aiRoutes = require("./routes/aiRoutes");
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/api/ai", aiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "MyAI Agent API is running!",
    status: "success",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "MyAI Agent is healthy",
  });
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`MyAI Agent server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
  });
