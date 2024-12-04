import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    chatType: {
      type: String,
      enum: ["group", "direct"],
      required: true,
      default: "direct",
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    groupName: {
      type: String,
      required: function () {
        return this.chatType === "group";
      },
    },
    commonLanguage: {
      type: String,
      required: function () {
        return this.chatType === "group";
      },
    },
    groupIcon: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/718/718339.png",
      required: function () {
        return this.chatType === "group";
      },
    },
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;
