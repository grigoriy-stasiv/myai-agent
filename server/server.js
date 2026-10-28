require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const aiRoutes = require("./routes/aiRoutes");
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

app.disable("x-powered-by");
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: "32kb" }));
app.use("/api/ai", aiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);

app.get("/", (req, res) => {
  res.json({ message: "MyAI Agent API is running!", status: "success" });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: mongoose.connection.readyState === 1 ? "OK" : "degraded",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.use((req, res) => res.status(404).json({ message: "Маршрут не знайдено" }));
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  const status = error.status === 413 ? 413 : 400;
  res.status(status).json({
    message: status === 413 ? "Запит завеликий" : "Некоректний запит",
  });
});

async function start() {
  const missing = ["MONGODB_URI", "JWT_SECRET"].filter((key) => !process.env[key]);
  if (process.env.MOCK_AI !== "true" && !process.env.OPENAI_API_KEY) {
    missing.push("OPENAI_API_KEY (або встанови MOCK_AI=true для тестового режиму)");
  }
  if (missing.length) {
    throw new Error(`Відсутні змінні середовища: ${missing.join(", ")}`);
  }
  if (process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET має містити щонайменше 32 символи");
  }

  await mongoose.connect(process.env.MONGODB_URI);
  const server = app.listen(PORT, () => console.log(`MyAI Agent server running on port ${PORT}`));

  const shutdown = async () => {
    server.close();
    await mongoose.disconnect();
    process.exit(0);
  };
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}

if (require.main === module) {
  start().catch((error) => {
    console.error(`Server startup failed: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = { app, start };
