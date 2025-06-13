// Imports
/* eslint-disable no-undef */

const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");



// App Config
dotenv.config();
const app = express();
/* global process */
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection (Updated)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// User Schema
const userSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  username: String,
  email: { type: String, unique: true },
  password: String,
  favorites: [
    {
      id: String,
      title: String,
      image: String,
      ingredients: [String]
    }
  ]
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
// OTP Schema
const otpSchema = new mongoose.Schema({
  email: String,
  otp: String,
  createdAt: { type: Date, default: Date.now, index: { expires: 300 } } // expires in 5 minutes
});

const OTP = mongoose.model("OTP", otpSchema);


const User = mongoose.model("User", userSchema);

// Default Route (For Render)
app.get("/", (req, res) => {
  res.send("Backend is running!");
  
});

// Routes

// Register Route
app.post("/register", async (req, res) => {
  const { firstname, lastname, username, email, password } = req.body;
  
  const hashedPassword = await bcrypt.hash(password, 6);
  const newUser = new User({ firstname, lastname, username, email, password: hashedPassword });
  
  try {
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  }
  // eslint-disable-next-line no-unused-vars 
  catch (error) {
    res.status(400).json({ error: "User already exists or invalid data" });
  }
});

// Login Route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  
  const user = await User.findOne({ email }).lean();
  if (!user) return res.status(404).json({ error: "User not found" });
  
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ id: user._id }, "secretKey", { expiresIn: "1h" });
  res.json({ message: "Login successful", token });
});

// Profile Route: Fetch the username from MongoDB
app.get("/working", async (req, res) => {
  // Get token from the Authorization header (format: "Bearer <token>")
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    // Verify token using your secret key
    const decoded = jwt.verify(token, "secretKey");
    // Find the user by ID and return only the username field
    const user = await User.findById(decoded.id).select("username");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  }
  // eslint-disable-next-line no-unused-vars  
  catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// Add this below your /login and /favorite routes
app.get("/favorite", async (req, res) => {
  console.log("GET /favorites called");
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    console.log("No token provided");
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, "secretKey");
    const user = await User.findById(decoded.id);
    if (!user) {
      console.log("User not found");
      return res.status(404).json({ error: "User not found" });
    }

    console.log("Returning favorites:", user.favorites.length);
    res.json(user.favorites || []);
  } catch (error) {
    console.log("Error verifying token or fetching favorites:", error);
    res.status(401).json({ error: "Invalid token" });
  }
});

app.post("/favorite", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, "secretKey");
    const user = await User.findById(decoded.id);
    const { recipe } = req.body;

    if (!user) return res.status(404).json({ error: "User not found" });

    const alreadyFavorited = user.favorites.some((fav) => fav.id === recipe.id);
    if (alreadyFavorited) {
      return res.status(400).json({ error: "Already favorited" });
    }

    user.favorites.push(recipe);
    await user.save();
    res.json({ message: "Recipe added to favorites" });
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

app.delete("/favorite", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, "secretKey");
    const user = await User.findById(decoded.id);
    const { recipe } = req.body;

    if (!user) return res.status(404).json({ error: "User not found" });

    user.favorites = user.favorites.filter(
      (fav) => String(fav.id) !== String(recipe.id)
    );

    await user.save();
    res.json({ message: "Recipe removed from favorites" });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Invalid token" });
  }
});

app.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    await OTP.deleteMany({ email }); // Remove existing OTPs
    await OTP.create({ email, otp: otpCode });

    await transporter.sendMail({
      from: `"Dishy" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Dishy OTP Code",
      text: `Your OTP is ${otpCode}. It is valid for 5 minutes.`,
    });

    res.json({ message: "OTP sent to email" });
  } catch (error) {
    console.error("OTP Send Error:", error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

app.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    const record = await OTP.findOne({ email, otp });
    if (!record) return res.status(400).json({ error: "Invalid or expired OTP" });

    await OTP.deleteMany({ email }); // Optional cleanup

    res.json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("OTP Verify Error:", error);
    res.status(500).json({ error: "OTP verification failed" });
  }
});

app.post("/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const hashedPassword = await bcrypt.hash(newPassword, 6);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
});

// Start Server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
