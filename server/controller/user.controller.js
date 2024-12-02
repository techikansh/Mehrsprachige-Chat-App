import User from "../models/User.model.js";

export async function updateUser(req, res) {
  const { userId, email } = req.user;
  const {
    firstName,
    lastName,
    email: newEmail,
    prefferedLanguage,
    avatar,
    status,
    lastSeen,
    contacts,
  } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      {
        firstName,
        lastName,
        email: newEmail,
        prefferedLanguage,
        avatar,
        status,
        lastSeen,
        contacts,
      },
      {
        new: true,
      }
    ).populate("contacts", "-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { password, ...userWithoutPassword } = user.toObject();
    return res.status(200).json({
      success: true,
      message: "User updated",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error!" });
  }
}


export async function fetchUser (req, res) {
  const { userId } = req.user;
  try {
    const user = await User.findById(userId).populate("contacts", "-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function fetchContacts (req, res) {
  const { userId } = req.user;
  try {
    const user = await User.findById(userId).populate("contacts", "-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      contacts:user.contacts,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function updateStatus(userId, status) {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      {
        status: status,
      },
      {
        new: true,
      }
    );
  } catch (error) {
    console.log(error);
  }
}
