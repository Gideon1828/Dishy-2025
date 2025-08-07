// Imports
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;

// App Config
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to verify JWT token
// Middleware
app.use(cors());
app.use(express.json());
app.use(session({ secret: "keyboard cat", resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
// In same file or extract later
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, "secretKey");
    req.user = await User.findById(decoded.id);
    if (!req.user) return res.status(404).json({ error: "User not found" });
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};



// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// User schema
const userSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  username: String,
  email: { type: String, unique: true },
  password: String,
  googleId: String,
  githubId: String,
  favorites: [
    {
      id: String,
      title: String,
      image: String,
      ingredients: [String],
    },
  ],
});



const otpSchema = new mongoose.Schema({
  email: String,
  otp: String,
  createdAt: { type: Date, default: Date.now, index: { expires: 300 } }
});

const ratingSchema = new mongoose.Schema({
  dishId: String,
  userId: String,
  username: String,
  rating: Number,
  comment: String,
  createdAt: { type: Date, default: Date.now }
});

const commentSchema = new mongoose.Schema({
  dishId: String,
  userId: String,
  username: String,
  comment: String,
  timestamp: { type: Date, default: Date.now }
});

const Comment = mongoose.model("Comment", commentSchema);

// Models
const User = mongoose.model("User", userSchema);
const OTP = mongoose.model("OTP", otpSchema);
const Rating = mongoose.model("Rating", ratingSchema);

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Default Route
app.get("/", (req, res) => res.send("Backend is running!"));

// Passport setup
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => User.findById(id).then(user => done(null, user)));

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "https://dishy-2g4s.onrender.com/auth/google/callback",
}, async (accessToken, refreshToken, profile, done) => {
  let user = await User.findOne({ googleId: profile.id });
  if (!user) {
    user = await User.create({
      firstname: profile.name.givenName,
      lastname: profile.name.familyName,
      username: profile.displayName,
      email: profile.emails[0].value,
      googleId: profile.id
    });
  }
  return done(null, user);
}));

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: "https://dishy-2g4s.onrender.com/auth/github/callback",
}, async (accessToken, refreshToken, profile, done) => {
  let user = await User.findOne({ githubId: profile.id });
  if (!user) {
    user = await User.create({
      username: profile.username,
      email: profile.emails?.[0]?.value || null,
      githubId: profile.id
    });
  }
  return done(null, user);
}));

// OAuth Routes
app.get('/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']  // MUST include 'email'
  })
);

app.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, "secretKey", { expiresIn: "1h" });
    res.redirect(`https://dishy2025.vercel.app/oauth-success?token=${token}`);
  }
);

app.get("/auth/github", passport.authenticate("github", { scope: ["user:email"] }));

app.get("/auth/github/callback", passport.authenticate("github", { failureRedirect: "/" }), (req, res) => {
  const token = jwt.sign({ id: req.user._id }, "secretKey", { expiresIn: "1h" });
  res.redirect(`https://dishy2025.vercel.app/oauth-success?token=${token}`); // you can change this URL
});

// Example success endpoint
app.get("/success", (req, res) => {
  res.send("OAuth login success! Token in query param.");
});
// AUTH ROUTES
app.post("/register", async (req, res) => {
  const { firstname, lastname, username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 6);
  const newUser = new User({ firstname, lastname, username, email, password: hashedPassword });
  try {
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(400).json({ error: "User already exists or invalid data" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).lean();
  if (!user) return res.status(404).json({ error: "User not found" });
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });
  const token = jwt.sign({ id: user._id }, "secretKey", { expiresIn: "1h" });
  res.json({ message: "Login successful", token });
});

app.get("/working", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, "secretKey");
    const user = await User.findById(decoded.id).select("username");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// FAVORITES
app.get("/favorite", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, "secretKey");
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user.favorites || []);
  } catch (error) {
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
    if (alreadyFavorited) return res.status(400).json({ error: "Already favorited" });

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

    user.favorites = user.favorites.filter(fav => String(fav.id) !== String(recipe.id));
    await user.save();
    res.json({ message: "Recipe removed from favorites" });
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// OTP + PASSWORD RESET
app.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  try {
    await OTP.deleteMany({ email });
    await OTP.create({ email, otp: otpCode });

    await transporter.sendMail({
      from: `"Dishy" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Dishy OTP Code",
      text: `Your OTP is ${otpCode}. It is valid for 5 minutes.`,
    });

    res.json({ message: "OTP sent to email" });
  } catch (error) {
    console.error("OTP send error:", error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

app.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  try {
    const record = await OTP.findOne({ email, otp });
    if (!record) return res.status(400).json({ error: "Invalid or expired OTP" });

    await OTP.deleteMany({ email });
    res.json({ message: "OTP verified successfully" });
  } catch (error) {
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
    const token = jwt.sign({ id: user._id }, "secretKey", { expiresIn: "1h" });
    res.json({ message: "Password reset successfully", token });
  } catch (error) {
    res.status(500).json({ error: "Failed to reset password" });
  }
});

// RATINGS AND COMMENTS
// Ratings
app.post("/rate-comment", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, "secretKey");
    const user = await User.findById(decoded.id);
    const { dishId, rating, comment } = req.body;

    if (!user) return res.status(404).json({ error: "User not found" });

    const existingRating = await Rating.findOne({ dishId, userId: user._id });
    if (existingRating) {
      existingRating.rating = rating;
      existingRating.comment = comment;
      existingRating.createdAt = new Date();
      await existingRating.save();
    } else {
      await Rating.create({
        dishId,
        userId: user._id,
        username: user.username,
        rating,
        comment
      });
    }

    res.json({ message: "Rating and comment submitted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to rate and comment" });
  }
});

app.get("/rate-comment/:dishId", verifyToken, async (req, res) => {
  const { dishId } = req.params;

  try {
    const allRatings = await Rating.find({ dishId });

    const userRatingDoc = await Rating.findOne({ dishId, userId: req.user._id });

    res.json({
      allRatings,
      userRating: userRatingDoc?.rating || null,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch ratings" });
  }
});


// Comments
app.post("/api/comments", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, "secretKey");
    const user = await User.findById(decoded.id);
    const { dishId, comment } = req.body;

    if (!user) return res.status(404).json({ error: "User not found" });

    const newComment = new Comment({
      dishId,
      userId: user._id,
      username: user.username,
      comment
    });

    await newComment.save();
    res.json({ message: "Comment posted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to post comment" });
  }
});

app.get("/comments/:dishId", async (req, res) => {
  const { dishId } = req.params;
  try {
    const comments = await Rating.find({ dishId }).sort({ timestamp: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

app.put("/api/comments/:id", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, "secretKey");
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const comment = await Rating.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    if (String(comment.userId) !== String(user._id)) {
      return res.status(403).json({ error: "You are not allowed to edit this comment" });
    }

    comment.comment = req.body.comment || comment.comment;
    comment.timestamp = new Date();
    await comment.save();

    res.json({ message: "Comment updated", updatedComment: comment });
  } catch (error) {
    res.status(500).json({ error: "Failed to update comment" });
  }
});

app.delete("/api/comments/:id", async (req, res) => {
  
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, "secretKey");
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const comment = await Rating.findById(req.params.id);
    if (!comment) {
      
      return res.status(404).json({ error: "Comment not found" });
    }

    if (String(comment.userId) !== String(user._id)) {
      return res.status(403).json({ error: "You are not allowed to delete this comment" });
    }

    await Rating.findByIdAndDelete(req.params.id);
    res.json({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete comment" });
  }
});






// Start Server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
