import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoute from "./routes/auth.route.js"

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(
    cors({
        origin: ["http://localhost:5173"],
        credentials: true,
    })
);

// Auth routes
app.use("/api/auth", authRoute);



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
