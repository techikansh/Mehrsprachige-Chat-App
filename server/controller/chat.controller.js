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
