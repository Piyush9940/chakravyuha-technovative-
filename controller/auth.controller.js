import User from "../model/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/**
 * 🔑 Generate JWT Token
 * @param {string} userId
 * @param {string} role
 * @returns JWT token valid for 7 days
 */
const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

/**
 * ✅ Register a new user
 * POST /api/auth/register
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const allowedRoles = ["driver", "manager", "customer"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await User.create({
      userId: `U${Date.now()}`,
      name,
      email,
      password: hashedPassword,
      role,
    });

    const token = generateToken(newUser._id, newUser.role);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        userId: newUser.userId,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        token,
      },
    });
  } catch (err) {
    console.error("Register Error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

 
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    // Check user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      },
    });
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * ✅ Logout user
 * POST /api/auth/logout
 */
export const logout = async (req, res) => {
  try {
    res.status(200).json({ success: true, message: "Logout successful. Remove token on client." });
  } catch (err) {
    console.error("Logout Error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
