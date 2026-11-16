
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Book = require("../models/Book");
const { protect, authorize } = require("../middleware/authMiddleware");

// GET: Retrieve all books
router.get("/", async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST: Add a new book (Seller only)
router.post("/", protect, authorize("seller"), async (req, res) => {
  try {
    const {
      title,
      author,
      description,
      price,
      category,
      image,
      stock,
    } = req.body;

    const book = new Book({
      title,
      author,
      description,
      price,
      category,
      image,
      stock,
      sellerId: req.user.id,
    });

    const savedBook = await book.save();

    res.status(201).json(savedBook);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PATCH: Update a seller's own book (Seller only)
router.patch("/:id", protect, authorize("seller"), async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid book ID" });
    }

    const allowedFields = [
      "title",
      "author",
      "description",
      "price",
      "category",
      "image",
      "stock",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields provided" });
    }

    const updatedBook = await Book.findOneAndUpdate(
      { _id: id, sellerId: req.user.id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedBook) {
      return res.status(404).json({
        message: "Book not found or you are not allowed to update it",
      });
    }

    res.status(200).json(updatedBook);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE: Delete a seller's own book (Seller only)
router.delete("/:id", protect, authorize("seller"), async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid book ID" });
    }

    const deletedBook = await Book.findOneAndDelete({
      _id: id,
      sellerId: req.user.id,
    });

    if (!deletedBook) {
      return res.status(404).json({
        message: "Book not found or you are not allowed to delete it",
      });
    }

    res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
