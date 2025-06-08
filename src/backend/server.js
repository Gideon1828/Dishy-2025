// Imports
/* eslint-disable no-undef */

const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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


// Start Server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
