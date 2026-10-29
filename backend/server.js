
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Allow the React frontend to communicate with the backend
app.use(cors());

// Allow the backend to read JSON data
app.use(express.json());

// First API: Check whether the backend is running
app.get("/", (req, res) => {
  res.send("Book E-Commerce Backend is Running!");
});

// Health check API
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend connected successfully",
  });
});

// Start the backend server
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
