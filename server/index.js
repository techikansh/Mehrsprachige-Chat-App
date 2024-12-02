import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";
import { createServer } from "http";
import jwt from "jsonwebtoken";

import authRoute from "./routes/auth.route.js";
import chatRoute from "./routes/chat.route.js";
import userRoute from "./routes/user.route.js";
import { updateStatus } from "./controller/user.controller.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 8081;
const httpServer = createServer(app);

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://localhost:5173",
      "http://127.0.0.1:5173",
      "https://127.0.0.1:5173",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// 2. Handle preflight requests
app.options("*", cors());

// 3. Other middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://localhost:5173",
      "http://127.0.0.1:5173",
      "https://127.0.0.1:5173",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

app.set("io", io);

// 5. Routes
app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/chat", chatRoute);

// 6. Socket.IO event handlers
io.on("connection", (socket) => {
  console.log("User Connected: ", socket.id);

  socket.on("join_chat", (chatId) => {
    socket.join(chatId);
    console.log("User Joined Chat: ", chatId);
  });

  socket.on("leave_chat", (chatId) => {
    socket.leave(chatId);
    console.log("User Left Chat: ", chatId);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected: ", socket.id);
  });
});

// API routes
app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/chat", chatRoute);

// Socket.io
io.on("connection", (socket) => {
  console.log("User Connected: ", socket.id);
  const token = socket.handshake.auth.token;
  if (!token) {
    console.log("No token provided");
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    updateStatus(userId, "online");

    // Emit status change to all connected clients
    io.emit("user_status_change", { userId, status: "online" });

    socket.on("join_chat", (chatId) => {
      socket.join(chatId);
      console.log(`User ${userId} Joined Chat: `, chatId);
    });

    socket.on("leave_chat", (chatId) => {
      socket.leave(chatId);
      console.log(`User ${userId} left Chat: `, chatId);
    });

    socket.on("disconnect", () => {
      console.log(`User ${userId} disconnected: `, socket.id);
      updateStatus(userId, "offline");
    //   Emit status change when user disconnects
        io.emit("user_status_change", { userId, status: "offline" });
    });
  } catch (error) {
    console.log(error);
  }
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    httpServer.listen(port, () => {
      console.log(`Server running at port ${port}`);
    });
  })
  .catch((err) => console.log(err));
