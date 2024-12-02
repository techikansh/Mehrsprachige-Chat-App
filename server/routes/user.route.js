import express from "express";
import { authenticateToken } from "../middleware/utils.js";
import { updateUser, fetchUser, fetchContacts } from "../controller/user.controller.js";

const router = express.Router();

router.put("/updateUser", authenticateToken, updateUser);
router.post("/fetchUser", authenticateToken, fetchUser);
router.get("/fetchContacts", authenticateToken, fetchContacts);

export default router;