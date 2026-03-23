require("dotenv").config();
const bcrypt = require("bcrypt");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("./models/user.model");
const travelstory = require("./models/travelStory.model");
const upload = require("./multer");
const fs = require("fs");
const path = require("path");
const { authToken } = require("./utilities");
const { error } = require("console");

const PORT = process.env.PORT || 8000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/traveldiary";
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "replace-me-with-a-secure-secret";

if (!process.env.MONGO_URI) {
  console.warn("Warning: MONGO_URI not set; using local MongoDB fallback. Set MONGO_URI in .env for production.");
}
if (!process.env.ACCESS_TOKEN_SECRET) {
  console.warn("Warning: ACCESS_TOKEN_SECRET not set; using insecure fallback. Set ACCESS_TOKEN_SECRET in .env for production.");
}

mongoose.connect(MONGO_URI, {
  tls: true,
  tlsAllowInvalidCertificates: false,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));


mongoose.connection
  .once("open", function () {
    console.log("Conection has been made!");
  })
  .on("error", function (error) {
    console.log("Error is: ", error);
  });

const app = express();
app.use(express.json());
app.use(cors({ 
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

//login user
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ error: true, message: "All fields are required" });
  }

  const isUser = await User.findOne({ email });
  if (!isUser) {
    return res
      .status(400)
      .json({ error: true, message: "User not found" });
  }

  const isPasswordValid = await bcrypt.compare(password, isUser.password);
  if (!isPasswordValid) {
    return res
      .status(400)
      .json({ error: true, message: "Invalid credentials" });
  }

  const accesstoken = jwt.sign(
    { userId: isUser._id },
    ACCESS_TOKEN_SECRET,
    {
      expiresIn: "72h",
    }
  );
  return res.status(200).json({
    error: false,
    user: { fullName: isUser.fullName, email: isUser.email },
    accesstoken,
    message: "Login successfull",
  });
});

//create user account
app.post("/create-user", async (req, res) => {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      return res
        .status(400)
        .json({ error: true, message: "All feilds are required" });
    }
  
    let isUser = await User.findOne({ email });
    if (isUser) {
      return res
        .status(400)
        .json({ error: true, message: "User already exists" });
    }
    console.log("Checking for user with email:", email, "Found:", isUser);
    const hashedpassword = await bcrypt.hash(password, 10);
    const user = new User({
      fullName,
      email,
      password: hashedpassword,
    });
    await user.save();
  
    const accesstoken = jwt.sign(
      { userId: user._id },
      ACCESS_TOKEN_SECRET,
      {
        expiresIn: "72h",
      }
    );
    return res.status(201).json({
      error: false,
      user: { fullName: user.fullName, email: user.email },
      accesstoken,
      message: "Registration successfull",
    });
  });

//get user
app.get("/get-user", authToken, async (req, res) => {
  try {
    const { userId } = req.user; // Extract userId from the verified token
    const isUser = await User.findOne({ _id: userId });

    if (!isUser) {
      console.error("User not found with ID:", userId);
      return res.sendStatus(404); // Not Found
    }

    return res.json({
      user: isUser,
      message: "User retrieved successfully.",
    });
  } catch (error) {
    console.error("Error fetching user:", error.message);
    return res.sendStatus(500); // Internal Server Error
  }
});

//add travel-story
app.post("/add-travel-story", authToken, async (req, res) => {
  const { title, story, visitedLocation, imageUrl, visitedDate } = req.body;
  const { userId } = req.user;

  if (!title || !story || !visitedDate) {
    return res
      .status(400)
      .json({ error: true, message: "Title, story, and date are required" });
  }

  //convert the visistedDate from millisecend to date object
  const parseVisistedDate = new Date(parseInt(visitedDate));

  try {
    const Travelstory = new travelstory({
      title,
      story,
      visitedLocation,
      userId,
      imageUrl,
      visitedDate: parseVisistedDate,
    });
    await Travelstory.save();
    res.status(201).json({ story: Travelstory, message: "added successfully" });
  } catch (error) {
    res.status(400).json({ error: true, message: error.message });
  }
});

//get all travel stories (user's own stories)
app.get("/get-travel-story", authToken, async (req, res) => {
  const { userId } = req.user;
  try {
    const travstory = await travelstory
      .find({ userId: userId })
      .populate("userId", "fullName email")
      .sort({ isFavourite: -1 });
    res.status(200).json({ stories: travstory });
  } catch (error) {
    res.status(400).json({ error: true, message: error.message });
  }
});

//serve static files from uploads dir
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/assets", express.static(path.join(__dirname, "assets")));
//route to the image upload (Cloudinary)
app.post("/image-upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ error: true, message: "No images uploaded" });
    }
    // Cloudinary already returns the URL in req.file.path
    const imageurl = req.file.path;

    res.status(201).json({ imageurl });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

//delete the image from Cloudinary
app.delete("/delete-image", async (req, res) => {
  const { imageUrl } = req.query;
  try {
    if (!imageUrl) {
      return res.status(400).json({
        error: true,
        message: "imageUrl parameter is required",
      });
    }
    
    // Cloudinary images are auto-managed; deletion is handled via API
    // For now, confirm deletion response
    res.status(200).json({ message: "Image marked for deletion" });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

//edit travel story
app.put("/edit-story/:id", authToken, async (req, res) => {
  const { id } = req.params;
  const { title, story, visitedLocation, imageUrl, visitedDate } = req.body;
  const { userId } = req.user;

  if (!title || !story || !visitedLocation || !visitedDate) {
    return res
      .status(400)
      .json({ error: true, message: "All fields are required" });
  }

  //convert the visistedDate from millisecend to date object
  const parseVisistedDate = new Date(parseInt(visitedDate));

  try {
    const Travelstory = await travelstory.findOne({ _id: id, userId: userId });
    if (!Travelstory) {
      return res
        .status(404)
        .json({ error: true, message: "Travel story not found" });
    }

    const placeholderUrl = `${BASE_URL}/assets/placeholder.png`;

    Travelstory.title = title;
    Travelstory.imageUrl = imageUrl || placeholderUrl;
    Travelstory.visitedLocation = visitedLocation;
    Travelstory.story = story;
    Travelstory.visitedDate = parseVisistedDate;

    await Travelstory.save();
    res
      .status(200)
      .json({ story: Travelstory, message: "Updated successfully" });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

//delete the travel story
app.delete("/delete-story/:id", authToken, async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;

  try {
    const Travelstory = await travelstory.findOne({ _id: id, userId: userId });
    if (!Travelstory) {
      return res
        .status(404)
        .json({ error: true, message: "Travel story not found" });
    }
    await Travelstory.deleteOne({ _id: id, userId: userId });

    //extract the filename of the image from the path and define it
    const filename = path.basename(Travelstory.imageUrl);
    const filepath = path.join(__dirname, "uploads", filename);
    fs.unlink(filepath, (err) => {
      if (err) {
        console.log("Failed to delete the image");
      }
    });
    res.status(200).json({ message: "image deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

//edit the isFav
app.put("/edit-isfav/:id", authToken, async (req, res) => {
  const { id } = req.params;
  const { isFavourite } = req.body;
  const { userId } = req.user;
  try {
    const Travelstory = await travelstory.findOne({ _id: id, userId: userId });

    if (!Travelstory) {
      return res
        .status(404)
        .json({ error: true, message: "Travel story not found" });
    }
    Travelstory.isFavourite = isFavourite;
    await Travelstory.save();
    res.status(200).json({ story: Travelstory, message: "updated " });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// Like/Unlike a travel story
app.put("/like-story/:id", authToken, async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;
  
  try {
    const Travelstory = await travelstory.findById(id);
    
    if (!Travelstory) {
      return res
        .status(404)
        .json({ error: true, message: "Travel story not found" });
    }
    
    const likeIndex = Travelstory.likes.findIndex(
      like => like.toString() === userId
    );
    
    if (likeIndex === -1) {
      // User hasn't liked yet - add like
      Travelstory.likes.push(userId);
      Travelstory.likeCount = (Travelstory.likeCount || 0) + 1;
    } else {
      // User already liked - remove like
      Travelstory.likes.splice(likeIndex, 1);
      Travelstory.likeCount = Math.max(0, (Travelstory.likeCount || 1) - 1);
    }
    
    await Travelstory.save();
    res.status(200).json({ 
      story: Travelstory, 
      isLiked: likeIndex === -1,
      message: likeIndex === -1 ? "Story liked" : "Story unliked" 
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// Get all stories (public feed - shows all users' stories with creator info)
app.get("/get-all-stories", authToken, async (req, res) => {
  try {
    const stories = await travelstory
      .find({})
      .populate("userId", "fullName email")
      .sort({ createdOn: -1 });
    res.status(200).json({ stories: stories });
  } catch (error) {
    res.status(400).json({ error: true, message: error.message });
  }
});

// search travel stories
app.get("/search", authToken, async (req, res) => {
  const { query } = req.query;
  const { userId } = req.user;

  if (!query) {
    return res.status(404).json({ error: true, message: "query is required" });
  }
  try {
    const searchResults = await travelstory
      .find({
        userId: userId, //$or: Allows matching any one of the specified conditions.
        $or: [
          { title: { $regex: query, $options: "i" } }, //$regex: Used for pattern matching in MongoDB queries.
          { story: { $regex: query, $options: "i" } }, //case insensitive
          { visitedLocation: { $regex: query, $options: "i" } },
        ],
      })
      .sort({ isFavourite: -1 });
    res.status(200).json({ stories: searchResults });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

//filter travel stories by date range
app.get("/travel-stroies/filter", authToken, async (req, res) => {
  const { startDate, endDate } = req.query;
  const { userId } = req.user;
  //convert date from millisec to date obj
  const start = new Date(parseInt(startDate));
  const end = new Date(parseInt(endDate));
  console.log(end);
  const filterUser = await travelstory
    .find({
      userId: userId,
      visitedDate: { $gte: start, $lte: end },
    })
    .sort({ isFavourite: -1 });

  res.status(200).json({ stories: filterUser });
  try {
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// Only start server if not in Vercel serverless environment
if (process.env.VERCEL === undefined) {
  app.listen(PORT, () => {
    console.log(`Server running at ${BASE_URL} (port ${PORT})`);
  });
}

module.exports = app;
