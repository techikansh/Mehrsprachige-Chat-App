import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoute from "./routes/auth.route.js"
import chatRoute from "./routes/chat.route.js"
import userRoute from "./routes/user.route.js"

dotenv.config();

const app = express();
const port = process.env.PORT || 8081;

app.use(express.json());
app.use(
    cors({
        origin: [
            "http://localhost:5173",  // React dev server
            "https://localhost:5173", // Secure version
            "http://127.0.0.1:5173",  // Alternative localhost
            "https://127.0.0.1:5173"  // Secure alternative
        ],
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        credentials: true,
    })
);
app.use(express.urlencoded({ extended: true }));




// Auth routes
app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
// Chat routes
app.use("/api/chat", chatRoute);



// Connect to MongoDB
mongoose
    .connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        app.listen(port, () => {
            console.log(`Server running at port ${port}`);
        });
    })
    .catch((err) => console.log(err));
