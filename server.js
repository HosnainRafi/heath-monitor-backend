const express = require("express");
const cors = require("cors");
require("dotenv").config(); // IMPORTANT: Set your environment variables in the Vercel dashboard!

const aiRoutes = require("./routes/ai");

const app = express();
app.use(cors());
app.use(express.json());

// 1. ADD A ROOT ROUTE FOR TESTING AND WELCOME MESSAGE
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the Health Monitor Backend API!",
    routes: {
      ai_prompts: "POST /api/generate-plan", // Example route
    },
  });
});

// Your existing API routes will still work
app.use("/api", aiRoutes);

// 2. REMOVE app.listen() AND EXPORT THE APP FOR VERCEL
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app; // This is the line Vercel needs!
