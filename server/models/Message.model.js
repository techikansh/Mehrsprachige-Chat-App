import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        // required: true,
    },
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
        required: true,
    },
    originalContent: {
        text: {type: String, required: true},
        // language: {type: String, required: true},
    },
    translatedContent: {
        text: {type: String, required: true},
        language: {type: String, required: true},
    },
    readBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }]
}, { timestamps: true });

const Message = mongoose.model("Message", messageSchema);
export default Message;