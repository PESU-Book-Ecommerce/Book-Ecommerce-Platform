const express = require("express");
const mongoose = require("mongoose");
const crypto = require("crypto");

const Payment = require("../models/Payment");
const Order = require("../models/Order");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// All payment routes require authentication
router.use(protect);

// POST /api/payments
// Simulate a payment for an existing order
router.post("/", async (req, res) => {
  try {
    const { orderId, paymentMethod, simulateResult } = req.body;

    if (!mongoose.isValidObjectId(orderId)) {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }

    if (!["upi", "card", "cod"].includes(paymentMethod)) {
      return res.status(400).json({
        message: "Invalid payment method",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      userId: req.user.id,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.orderStatus === "cancelled") {
      return res.status(400).json({
        message: "Cannot pay for a cancelled order",
      });
    }

    if (order.paymentStatus === "paid") {
      return res.status(409).json({
        message: "Order is already paid",
      });
    }

    const existingPayment = await Payment.findOne({ orderId });

    if (existingPayment) {
      return res.status(409).json({
        message: "Payment already exists for this order",
      });
    }

    // For this college project, no real money is processed.
    // COD remains pending until payment is collected.
    const status =
      paymentMethod === "cod"
        ? "pending"
        : simulateResult === "failed"
          ? "failed"
          : "success";

    const payment = await Payment.create({
      orderId: order._id,
      userId: req.user.id,
      amount: order.totalAmount,
      paymentMethod,
      paymentStatus: status,
      transactionId:
        status === "success" ? "DEMO-" + crypto.randomUUID() : null,
      paidAt: status === "success" ? new Date() : null,
    });

    // Synchronize the payment status stored on the order
    order.paymentStatus = status === "success" ? "paid" : status;

    await order.save();

    res.status(201).json({
      message: "Simulated payment processed",
      simulated: true,
      payment,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Payment already exists",
      });
    }

    console.error(error);
    res.status(500).json({
      message: "Payment processing failed",
    });
  }
});

// GET /api/payments/:orderId
// Retrieve payment status for the logged-in customer
router.get("/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!mongoose.isValidObjectId(orderId)) {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      userId: req.user.id,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    const payment = await Payment.findOne({
      orderId,
      userId: req.user.id,
    });

    res.json({
      orderId,
      orderPaymentStatus: order.paymentStatus,
      payment: payment || null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Unable to retrieve payment status",
    });
  }
});

module.exports = router;
