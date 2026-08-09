const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail");

// @route  POST /api/auth/register
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, email and password are all required" });
    }

    // Guard against non-string payloads (e.g. NoSQL injection via objects like { "$gt": "" })
    if (typeof username !== "string" || typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ message: "Username, email and password must be strings" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim();

    const existingUser = await User.findOne({ $or: [{ email: normalizedEmail }, { username: normalizedUsername }] });
    if (existingUser) {
      return res.status(409).json({ message: "Username or email is already registered" });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({ username: normalizedUsername, email: normalizedEmail, passwordHash });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error during registration", error: error.message });
  }
};

// @route  POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Guard against non-string payloads (e.g. NoSQL injection via objects like { "$gt": "" })
    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ message: "Email and password must be strings" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // passwordHash has select:false on the schema, so it must be explicitly requested
    const user = await User.findOne({ email: normalizedEmail }).select("+passwordHash");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error during login", error: error.message });
  }
};

// @route  POST /api/auth/logout
const logout = async (req, res) => {
  // gives the frontend a clean action to call.
  res.status(200).json({ message: "Logged out successfully" });
};

// @route  GET /api/auth/me (protected)
const getMe = async (req, res) => {
  res.status(200).json({
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      createdAt: req.user.createdAt,
    },
  });
};

// @route  PUT /api/auth/change-password (protected)
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are both required" });
    }
    if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
      return res.status(400).json({ message: "Passwords must be strings" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user._id).select("+passwordHash");
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(12);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error while changing password", error: error.message });
  }
};

// @route  POST /api/auth/forgot-password
// Always responds with the same generic message whether or not the email
// exists, so this endpoint can't be used to enumerate registered accounts.
const forgotPassword = async (req, res) => {
  const genericMessage = "If an account exists for that email, a reset link has been sent.";
  try {
    const { email } = req.body;
    if (!email || typeof email !== "string") {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(200).json({ message: genericMessage });
    }

    // Generate a raw token to email to the user, but only ever store its
    // hash — a database leak alone then can't be used to reset passwords.
    const rawToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    const clientUrl = (process.env.CLIENT_URL || "http://localhost:5173").split(",")[0].trim();
    const resetUrl = `${clientUrl}/reset-password/${rawToken}`;

    try {
      await sendEmail({
        to: user.email,
        subject: "Reset your Codexa password",
        html: `
          <p>Hi ${user.username},</p>
          <p>You requested a password reset for your Codexa account. This link expires in 15 minutes:</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>If you didn't request this, you can safely ignore this email.</p>
        `,
        text: `Reset your Codexa password: ${resetUrl} (expires in 15 minutes)`,
      });
    } catch (emailError) {
      // Don't leave a dangling valid token if the email never actually sent.
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      console.error("Failed to send reset email:", emailError.message);
      return res.status(500).json({ message: "Failed to send reset email. Please try again later." });
    }

    res.status(200).json({ message: genericMessage });
  } catch (error) {
    res.status(500).json({ message: "Server error during password reset request", error: error.message });
  }
};

// @route  PUT /api/auth/reset-password/:token
const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    }).select("+resetPasswordToken +resetPasswordExpire");

    if (!user) {
      return res.status(400).json({ message: "This reset link is invalid or has expired" });
    }

    const salt = await bcrypt.genSalt(12);
    user.passwordHash = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Log the user straight in after a successful reset.
    const token = generateToken(user._id);

    res.status(200).json({
      message: "Password reset successfully",
      token,
      user: { id: user._id, username: user.username, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error while resetting password", error: error.message });
  }
};

module.exports = { register, login, logout, getMe, changePassword, forgotPassword, resetPassword };
