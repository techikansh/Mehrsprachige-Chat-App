import express from "express";
import { authenticateToken } from "../middleware/utils.js";
import { findUsers } from "../controller/chat.controller.js";

const router = express.Router();

router.post("/findUsers", authenticateToken, findUsers);

export default router;