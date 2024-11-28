import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        prefferedLanguage: { type: String, default: "de" },
        avatar: {
            type: String,
            default:
                "https://i.pinimg.com/474x/94/cb/68/94cb68baea50bb98cdab65b74e731c1c.jpg",
        },
        status: { type: String, default: "offline" },
        lastSeen: { type: Date },
        contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
