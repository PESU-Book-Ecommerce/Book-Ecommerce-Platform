
const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");

const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Book = require("../models/Book");

const { protect, authorize } = require("../middleware/authMiddleware");

// POST: Place an order (Customer only)
router.post("/", protect, authorize("customer"), async (req, res) => {
  const deductedItems = [];
  let createdOrder = null;

  try {
    const { shippingAddress } = req.body;

    // Validate shipping address
    const requiredFields = [
      "fullName",
      "phone",
      "addressLine",
      "city",
      "state",
      "pincode",
    ];

    if (
      !shippingAddress ||
      typeof shippingAddress !== "object" ||
      Array.isArray(shippingAddress)
    ) {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required",
      });
    }

    for (const field of requiredFields) {
      if (
        typeof shippingAddress[field] !== "string" ||
        !shippingAddress[field].trim()
      ) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`,
        });
      }
    }

    if (!/^\d{10}$/.test(shippingAddress.phone.trim())) {
      return res.status(400).json({
        success: false,
        message: "Phone number must contain exactly 10 digits",
      });
    }

    if (!/^\d{6}$/.test(shippingAddress.pincode.trim())) {
      return res.status(400).json({
        success: false,
        message: "Pincode must contain exactly 6 digits",
      });
    }

    // Find customer's cart
    const cart = await Cart.findOne({ userId: req.user.id });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty",
      });
    }

    const orderItems = [];
    let totalAmount = 0;

    // Validate books and prepare order items
    for (const item of cart.items) {
      if (
        !Number.isInteger(item.quantity) ||
        item.quantity < 1
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid book quantity in cart",
        });
      }

      const book = await Book.findById(item.bookId);

      if (!book) {
        return res.status(404).json({
          success: false,
          message: "A book in your cart was not found",
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

    // Deduct stock using conditional atomic updates
    for (const item of orderItems) {
      const updatedBook = await Book.findOneAndUpdate(
        {
          _id: item.bookId,
          stock: { $gte: item.quantity },
        },
        {
          $inc: { stock: -item.quantity },
      },
        { new: true }
      );

      if (!updatedBook) {
        throw new Error(`INSUFFICIENT_STOCK:${item.title}`);
      }

      deductedItems.push({
        bookId: item.bookId,
        quantity: item.quantity,
      });
    }

    // Create order
    createdOrder = await Order.create({
      userId: req.user.id,
      items: orderItems,
      totalAmount,
      shippingAddress: {
        fullName: shippingAddress.fullName.trim(),
        phone: shippingAddress.phone.trim(),
        addressLine: shippingAddress.addressLine.trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.trim(),
        pincode: shippingAddress.pincode.trim(),
      },
    });

    // Clear cart only if it has not changed since it was read
    const clearedCart = await Cart.updateOne(
      {
        _id: cart._id,
        updatedAt: cart.updatedAt,
      },
      {
        $set: { items: [] },
      }
    );

    if (clearedCart.modifiedCount !== 1) {
      throw new Error("CART_CHANGED");
    }

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: createdOrder,
    });

  } catch (error) {
    // Roll back the order if it was created
    if (createdOrder) {
      try {
        await Order.findByIdAndDelete(createdOrder._id);
      } catch (rollbackError) {
        console.error("Order rollback failed:", rollbackError);
      }
    }

    // Restore deducted stock
    for (const item of deductedItems) {
      try {
        await Book.updateOne(
          { _id: item.bookId },
          { $inc: { stock: item.quantity } }
        );
      } catch (rollbackError) {
        console.error("Stock rollback failed:", rollbackError);
      }
    }

    if (error.message.startsWith("INSUFFICIENT_STOCK:")) {
      return res.status(409).json({
        success: false,
        message: `Insufficient stock for ${error.message.split(":")[1]}`,
      });
    }

    if (error.message === "CART_CHANGED") {
      return res.status(409).json({
        success: false,
        message: "Your cart changed during checkout. Please try again.",
      });
    }

    console.error("Place order error:", error);

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
    console.error("Order history error:", error);

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
    console.error("Seller orders error:", error);

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

    if (!mongoose.Types.ObjectId.isValid(req.params.orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
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
    console.error("Update order status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update order status",
    });
  }
});

module.exports = router;
