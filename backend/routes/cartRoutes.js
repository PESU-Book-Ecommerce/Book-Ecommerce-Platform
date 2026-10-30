const express = require("express");
const router = express.Router();

const Cart = require("../models/Cart");
const Book = require("../models/Book");

const { protect, authorize } = require("../middleware/authMiddleware");
// POST: Add a book to the customer's cart
router.post("/add", protect, authorize("customer"), async (req, res) => {
  try {
    const { bookId, quantity = 1 } = req.body;

    if (!bookId || !Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Valid book ID and quantity are required",
      });
    }

    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    if (book.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock",
      });
    }

    let cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      cart = new Cart({
        userId: req.user.id,
        items: [],
      });
    }

    const existingItem = cart.items.find(
      (item) => item.bookId.toString() === bookId
    );

    if (existingItem) {
      if (book.stock < existingItem.quantity + quantity) {
        return res.status(400).json({
          success: false,
          message: "Requested quantity exceeds available stock",
        });
      }

      existingItem.quantity += quantity;
    } else {
      cart.items.push({ bookId, quantity });
    }

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Book added to cart successfully",
      cart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to add book to cart",
    });
  }
});

// GET: View customer's cart
router.get("/", protect, authorize("customer"), async (req, res) => {
  try {
    const cart = await Cart.findOne({
      userId: req.user.id,
    }).populate("items.bookId");

    if (!cart) {
      return res.status(200).json({
        success: true,
        message: "Your cart is empty",
        cart: [],
      });
    }

    return res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve cart",
    });
  }
});

// DELETE: Remove a book from the customer's cart
router.delete("/remove/:bookId", protect, authorize("customer"), async (req, res) => {
  try {
    const cart = await Cart.findOne({
      userId: req.user.id,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    cart.items = cart.items.filter(
      (item) => item.bookId.toString() !== req.params.bookId
    );

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Book removed from cart",
      cart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to remove book from cart",
    });
  }
});

module.exports = router;