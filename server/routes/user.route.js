import express from "express";
import { authenticateToken } from "../middleware/utils.js";
import { updateUser } from "../controller/user.controller.js";

const router = express.Router();

router.put("/updateUser", authenticateToken, updateUser);

export default router;