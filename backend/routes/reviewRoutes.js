const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Review = require("../models/Review");
const Book = require("../models/Book");
const { protect } = require("../middleware/authMiddleware");

// GET: Retrieve approved reviews for a book
router.get("/:bookId/reviews", async (req, res) => {
  try {
    const { bookId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid book ID",
      });
    }

    const reviews = await Review.find({
      bookId,
      isApproved: true,
    })
      .select("bookId rating comment createdAt")
      .sort({ createdAt: -1 });

    return res.status(200).json(reviews);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// POST: Submit a review (authenticated users)
router.post("/:bookId/reviews", protect, async (req, res) => {
  try {
    const { bookId } = req.params;
    const { rating, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid book ID",
      });
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be a whole number between 1 and 5",
      });
    }

    if (
      comment !== undefined &&
      (typeof comment !== "string" || comment.trim().length > 1000)
    ) {
      return res.status(400).json({
        success: false,
        message: "Comment must be a string of at most 1000 characters",
      });
    }

    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    const existingReview = await Review.findOne({
      bookId,
      userId: req.user.id,
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this book",
      });
    }

    const review = await Review.create({
      bookId,
      userId: req.user.id,
      rating,
      comment: comment ? comment.trim() : "",
      isApproved: false,
    });

    return res.status(201).json({
      success: true,
      message: "Review submitted for approval",
      review,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this book",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;