import Chat from "../models/Chat.model.js";
import Message from "../models/Message.model.js";
import User from "../models/User.model.js";

export async function findUsers(req, res) {
  const { searchString } = req.body;
  const { userId, email } = req.user;
  try {
    const users = await User.find({
      $or: [
        { firstName: { $regex: searchString, $options: "i" } },
        { lastName: { $regex: searchString, $options: "i" } },
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
            chatType: 'direct',
            participants: { $all: [userId, receiverId]}
        })
        if (!chat) {
            chat = await Chat.create({
                chatType: 'direct',
                participants: [userId, receiverId]
            })
        }
        return res.status(201).json({
            success:true,
            chat
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

export async function sendMessage (req, res) {
    const { userId } = req.user;
    const { chatId, receiverId, text } = req.body;

    try {
        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found"
            });
        }

        const message = await Message.create({
            sender: userId,
            receiver: receiverId,
            chat: chatId,
            originalContent: {
                text,
                language: 'en' // For now hardcoding to English
            },
            translatedContent: {
                text,
                language: 'en' // For now same as original
            }
        });
        
        // Update last message in chat
        await Chat.findByIdAndUpdate(chatId, {lastMessage: message._id});

        return res.status(200).json({
            success: true,
            message
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}


// Get chat messages
export async function getChatMessages(req, res) {
    const { chatId } = req.params;
    try {
        const messages = await Message.find({ chat: chatId })
            .populate('sender', 'firstName lastName avatar')
            .sort({ createdAt: 1 }); // oldest first

        return res.status(200).json({
            success: true,
            messages
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
        
    }
}