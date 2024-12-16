import { translateText } from "../middleware/utils.js";
import Chat from "../models/Chat.model.js";
import Message from "../models/Message.model.js";
import User from "../models/User.model.js";

export async function findUsers(req, res) {
  const { searchString } = req.body;
  const { userId, email } = req.user;

  try {
    const users = await User.find({
      $and: [
        {
          $or: [
            { firstName: { $regex: searchString, $options: "i" } },
            { lastName: { $regex: searchString, $options: "i" } },
          ],
        },
        { _id: { $ne: userId } }, // Exclude the user with the same _id as userId
      ],
    });

    if (users.length > 0) {
      const usersWithoutPasswords = users.map((user) => {
        const { password, ...userWithoutPassword } = user.toObject();
        return userWithoutPassword;
      });

      return res.status(200).json({
        success: true,
        users: usersWithoutPasswords,
      });
    } else {
      return res.status(200).json({
        success: false,
        message: "No users found",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function createOrGetChat(req, res) {
  const { userId } = req.user;
  const { receiverId } = req.body;

  try {
    let chat = await Chat.findOne({
      chatType: "direct",
      participants: { $all: [userId, receiverId] },
    });
    if (!chat) {
      chat = await Chat.create({
        chatType: "direct",
        participants: [userId, receiverId],
        lastMessage: null,
      });
    }
    return res.status(201).json({
      success: true,
      chat,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function sendMessage(req, res) {
  const { userId } = req.user;
  const { chatId, receiverId, text } = req.body;

  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    let message;

    if (chat.chatType == "direct") {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const receiver = await User.findById(receiverId);
      if (!receiver) {
        return res.status(404).json({
          success: false,
          message: "Reeiver not found",
        });
      }

      const prefferedLanguage = receiver.prefferedLanguage;
      const translatedText = await translateText(text, prefferedLanguage);

      message = await Message.create({
        sender: userId,
        receiver: receiverId,
        chat: chatId,
        originalContent: {
          text,
        },
        translatedContent: {
          text: translatedText,
          language: prefferedLanguage,
        },
      });
    } else {
      const prefferedLanguage = chat.commonLanguage;
      const translatedText = await translateText(text, prefferedLanguage);
      message = await Message.create({
        sender: userId,
        receiver: null,
        chat: chatId,
        originalContent: {
          text,
        },
        translatedContent: {
          text: translatedText,
          language: prefferedLanguage,
        },
      });
    }

    // Populate sender information
    await message.populate("sender", "firstName lastName email avatar");
    // console.log(message);

    // Update last message in chat
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        lastMessage: message._id,
      },
      { new: true }
    )
      .populate("participants", "firstName lastName email avatar status")
      .populate(
        "lastMessage",
        "sender receiver translatedContent.text createdAt readBy"
      );

    // Emit the new message to all users in the chat
    req.app.get("io").to(chatId).emit("new_message", {message, chat: updatedChat});

    return res.status(200).json({
      success: true,
      message,
      chat: updatedChat,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
export async function updateMessage (req, res){
  const messageId = req.params.messageId;
  const { readBy } = req.body;

  try {
    const message = await Message.findByIdAndUpdate(
      messageId,
      { $addToSet: { readBy: readBy } },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    return res.status(200).json({
      success: true,
      message,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}


export async function getChatMessages(req, res) {
  const { chatId } = req.params;
  try {
    const messages = await Message.find({ chat: chatId })
      .populate("sender", "firstName lastName email avatar")
      .sort({ createdAt: 1 }); // oldest first

    return res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function createGroup(req, res) {
  const { userId } = req.user;
  let { groupName, participants, commonLanguage, groupIcon } = req.body;

  try {
    participants = [...participants, userId];

    const chat = await Chat.create({
      chatType: "group",
      participants: participants,
      groupName: groupName,
      commonLanguage: commonLanguage,
      groupIcon: groupIcon,
      lastMessage: null,
    });

    await chat.populate("participants", "firstName lastName email avatar");

    return res.status(200).json({
      success: true,
      chat: chat,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function updateGroupSettings(req, res) {
  const { userId } = req.user;
  const { chatId } = req.params;
  const { groupName, commonLanguage, participants, groupIcon } = req.body;

  // console.log("Entered updateGroupSettings function...");
  // console.log(req.body);

  try {
    const updateFields = {};
    if (groupName) updateFields.groupName = groupName;
    if (commonLanguage) updateFields.commonLanguage = commonLanguage;
    if (participants) updateFields.participants = participants;
    if (groupIcon) updateFields.groupIcon = groupIcon;

    const chat = await Chat.findByIdAndUpdate(
      chatId,
      {
        $set: updateFields,
      },
      { new: true }
    ).populate("participants", "firstName lastName avatar");

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }
    // console.log(chat);
    return res.status(200).json({
      success: true,
      chat,
      message: "Group settings updated successfully",
    });
  } catch (error) {
    console.error("Error updating group settings:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function fetchUserChats(req, res) {
  const { userId } = req.user;
  try {
    const chats = await Chat.find({
      participants: userId,
    })
      .sort({ lastMessage: -1 })
      .populate("participants", "firstName lastName email avatar status")
      .populate(
        "lastMessage",
        "sender receiver translatedContent.text createdAt readBy"
      );

    // console.log(chats);
    return res.status(200).json({
      success: true,
      chats,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

/*
_id: "675333efc32832a1138b71e0"
​
chatType: "group"
​
commonLanguage: "de"
​
createdAt: "2024-12-06T17:27:11.314Z"
​
groupIcon: "https://cdn-icons-png.flaticon.com/512/718/718339.png"
​
groupName: "Group 1 - Test"
​
participants: Array(3) [ {…}, {…}, {…} ]
​​
0: Object { _id: "6747e346ad5dc081d83370fc", firstName: "Rakesh", lastName: "Kumar", … }
​​
1: Object { _id: "674a64b0ab3d6881738493ec", firstName: "Komal", lastName: "Kumar", … }
​​
2: Object { _id: "6747e319ad5dc081d83370f6", firstName: "Devansh", lastName: "Kumar", … }
*/
