const bookRoutes = require("./routes/bookRoutes");
const authRoutes = require("./routes/authRoutes"); 
const orderRoutes = require("./routes/orderRoutes");
const cartRoutes = require("./routes/cartRoutes");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;
const paymentRoutes = require("./routes/paymentRoutes");

app.use(cors());
app.use(express.json());

app.use("/api/books", bookRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully!");
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });

// Home route
app.get("/", (req, res) => {
  res.send("Book E-Commerce Backend is Running!");
});

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend connected successfully",
    database:
      mongoose.connection.readyState === 1
        ? "Connected"
        : "Disconnected",
  });
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});

app.use("/api/payments", paymentRoutes);