
const express = require("express");
const router = express.Router();
const Book = require("../models/Book");

// GET: Retrieve all books
router.get("/", async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST: Add a new book
router.post("/", async (req, res) => {
  try {
    const { title, author, description, price, category, image, stock, sellerId } =
      req.body;

    const book = new Book({
      title,
      author,
      description,
      price,
      category,
      image,
      stock,
      sellerId,
    });

    const savedBook = await book.save();
    res.status(201).json(savedBook);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
