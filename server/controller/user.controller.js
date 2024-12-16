import User from "../models/User.model.js";

export async function updateUser(req, res) {
  const { userId } = req.user;
  const {
    firstName,
    lastName,
    email,
    prefferedLanguage,
    avatar,
    password
  } = req.body;

  try {
    // Create update object with only provided fields
    const updateObject = {};
    if (firstName) updateObject.firstName = firstName;
    if (lastName) updateObject.lastName = lastName;
    if (email) updateObject.email = email;
    if (prefferedLanguage) updateObject.prefferedLanguage = prefferedLanguage;
    if (avatar) updateObject.avatar = avatar;
    if (password) updateObject.password = password;

    const user = await User.findByIdAndUpdate(
      userId,
      updateObject,
      { new: true }
    ).populate("contacts", "-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { password: _, ...userWithoutPassword } = user.toObject();
    return res.status(200).json({
      success: true,
      message: "User updated",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Internal server error!" });
  }
}

export async function fetchUser(req, res) {
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

export async function fetchContacts(req, res) {
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
      contacts: user.contacts,
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
