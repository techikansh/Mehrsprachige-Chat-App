import express from "express";
import { authenticateToken } from "../middleware/utils.js";
import {
    findUsers,
    createOrGetChat,
    sendMessage,
    getChatMessages,
    createGroup,
    fetchUserChats,
} from "../controller/chat.controller.js";

const router = express.Router();

router.post("/findUsers", authenticateToken, findUsers);
router.post("/createChat", authenticateToken, createOrGetChat);
router.post("/sendMessage", authenticateToken, sendMessage);
router.get("/getMessages/:chatId", authenticateToken, getChatMessages);
router.post("/createGroup", authenticateToken, createGroup);
router.get("/fetchUserChats", authenticateToken, fetchUserChats);

export default router;
