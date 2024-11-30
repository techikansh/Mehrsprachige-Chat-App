import express from "express";
import { authenticateToken } from "../middleware/utils.js";
import { findUsers, createOrGetChat, sendMessage, getChatMessages } from "../controller/chat.controller.js";

const router = express.Router();

router.post("/findUsers", authenticateToken, findUsers);
router.post("/createChat", authenticateToken, createOrGetChat);
router.post("/sendMessage", authenticateToken, sendMessage);
router.get("/getMessages/:chatId", authenticateToken, getChatMessages);

export default router;