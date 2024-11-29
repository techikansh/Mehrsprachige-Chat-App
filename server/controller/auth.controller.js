import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

export async function register(req, res) {
    try {
        const { firstName, lastName, email, password } = req.body;

        // Input validation
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const user = await User.findOne({ email });
        if (user) {
            console.log(user);
            return res.status(400).json({
                success: false,
                message: "User already exists",
            });
        }

        const newUser = new User({ firstName, lastName, email, password });
        await newUser.save();

        return res.status(201).json({
            success: true,
            message: "Registeration successful!",
        });
    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong!",
        });
    }
}

export async function login(req, res) {
    try {
        const { email, password } = req.body;

        // Input validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        // Find user and populate contacts
        const user = await User.findOne({ email }).populate('contacts', '-password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        if (user.password != password) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        const { password: pass, ...userWithoutPassword } = user.toObject();

        return res.status(200).json({
            success: true,
            token,
            user: userWithoutPassword
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong!",
        });
    }
}
