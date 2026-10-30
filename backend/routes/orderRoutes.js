const express = require("express");
const router = express.Router();

const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Book = require("../models/Book");

const { protect, authorize } = require("../middleware/authMiddleware");
// POST: Place an order (Customer only)
router.post("/", protect, authorize("customer"), async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required",
      });
    }

    const requiredFields = [
      "fullName",
      "phone",
      "addressLine",
      "city",
      "state",
      "pincode",
    ];

    for (const field of requiredFields) {
      if (!shippingAddress[field]) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`,
        });
      }
    }

    const cart = await Cart.findOne({ userId: req.user.id });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty",
      });
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const item of cart.items) {
      const book = await Book.findById(item.bookId);

      if (!book) {
        return res.status(404).json({
          success: false,
          message: "A book in your cart was not found",
        });
      }

      if (book.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${book.title}`,
        });
      }

      orderItems.push({
        bookId: book._id,
        sellerId: book.sellerId,
        title: book.title,
        price: book.price,
        quantity: item.quantity,
      });

      totalAmount += book.price * item.quantity;
    }

    for (const item of cart.items) {
      await Book.findByIdAndUpdate(item.bookId, {
        $inc: { stock: -item.quantity },
      });
    }

    const order = await Order.create({
      userId: req.user.id,
      items: orderItems,
      totalAmount,
      shippingAddress,
    });

    cart.items = [];
    await cart.save();

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to place order",
    });
  }
});
// GET: Customer order history
router.get("/my-orders", protect, authorize("customer"), async (req, res) => {
  try {
    const orders = await Order.find({
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve order history",
    });
  }
});
// GET: Seller orders
router.get("/seller-orders", protect, authorize("seller"), async (req, res) => {
  try {
    const orders = await Order.find({
      "items.sellerId": req.user.id,
    })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    const sellerOrders = orders.map((order) => ({
      ...order.toObject(),
      items: order.items.filter(
        (item) => item.sellerId?.toString() === req.user.id
      ),
    }));

    return res.status(200).json({
      success: true,
      count: sellerOrders.length,
      orders: sellerOrders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve seller orders",
    });
  }
});
// PUT: Update order status (Seller only)
router.put("/:orderId/status", protect, authorize("seller"), async (req, res) => {
  try {
    const { orderStatus } = req.body;

    const allowedStatuses = [
      "confirmed",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const order = await Order.findOne({
      _id: req.params.orderId,
      "items.sellerId": req.user.id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const allItemsBelongToSeller = order.items.every(
      (item) => item.sellerId?.toString() === req.user.id
    );

    if (!allItemsBelongToSeller) {
      return res.status(403).json({
        success: false,
        message: "You cannot update an order containing other sellers' books",
      });
    }

    order.orderStatus = orderStatus;
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update order status",
    });
  }
});

module.exports = router;