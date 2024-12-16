import express from "express";
import { authenticateToken } from "../middleware/utils.js";
import {
    findUsers,
    createOrGetChat,
    sendMessage,
    getChatMessages,
    createGroup,
    updateGroupSettings,
    fetchUserChats,
    updateMessage,
    deleteMessage
} from "../controller/chat.controller.js";

const router = express.Router();

router.post("/findUsers", authenticateToken, findUsers);
router.post("/createChat", authenticateToken, createOrGetChat);
router.post("/sendMessage", authenticateToken, sendMessage);
router.get("/getMessages/:chatId", authenticateToken, getChatMessages);
router.post("/createGroup", authenticateToken, createGroup);
router.put("/editGroup/:chatId", authenticateToken, updateGroupSettings);
router.get("/fetchUserChats", authenticateToken, fetchUserChats);
router.put("/updateMessage/:messageId", authenticateToken, updateMessage);
router.delete("/deleteMessage/:messageId", authenticateToken, deleteMessage);

export default router;
