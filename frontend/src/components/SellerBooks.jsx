import { useState } from "react";
import "./SellerBooks.css";

const STORAGE_KEY = "bookstore_demo_seller_books";

function loadBooks() {
  try {
    const books = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(books) ? books : [];
  } catch {
    return [];
  }
}

const emptyForm = {
  title: "",
  author: "",
  category: "",
  price: "",
  stock: "",
};

export default function SellerBooks() {
  const [books, setBooks] = useState(loadBooks);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  function saveBooks(nextBooks) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextBooks));
      setBooks(nextBooks);
      setError("");
      return true;
    } catch {
      setError("Unable to save listings. Check your browser storage.");
      return false;
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const title = form.title.trim();
    const author = form.author.trim();
    const category = form.category.trim();
    const price = Number(form.price);
    const stock = Number(form.stock);

    if (!title || !author || !category) {
      setError("Please complete all book details.");
      return;
    }

    if (form.price.trim() === "" || !Number.isFinite(price) || price <= 0) {
      setError("Price must be greater than zero.");
      return;
    }

    if (form.stock.trim() === "" || !Number.isInteger(stock) || stock < 0) {
      setError("Stock must be a non-negative whole number.");
      return;
    }

    const bookData = {
      title,
      author,
      category,
      price,
      stock,
    };

    let nextBooks;

    if (editingId !== null) {
      nextBooks = books.map((book) =>
        book.id === editingId ? { ...book, ...bookData } : book,
      );
    } else {
      nextBooks = [
        ...books,
        {
          id: crypto.randomUUID(),
          ...bookData,
        },
      ];
    }

    if (saveBooks(nextBooks)) {
      setForm({ ...emptyForm });
      setEditingId(null);
    }
  }

  function editBook(book) {
    setEditingId(book.id);
    setForm({
      title: book.title,
      author: book.author,
      category: book.category,
      price: String(book.price),
      stock: String(book.stock),
    });
    setError("");
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setError("");
  }

  function deleteBook(id) {
    const confirmed = window.confirm("Delete this listing?");

    if (!confirmed) return;

    const nextBooks = books.filter((book) => book.id !== id);

    if (saveBooks(nextBooks) && editingId === id) {
      setEditingId(null);
      setForm({ ...emptyForm });
    }
  }

  return (
    <section className="seller-books">
      <h2>Seller Book Management</h2>

      <form onSubmit={handleSubmit}>
        <input
          name="title"
          placeholder="Book title"
          value={form.title}
          onChange={handleChange}
          required
        />

        <input
          name="author"
          placeholder="Author"
          value={form.author}
          onChange={handleChange}
          required
        />

        <input
          name="category"
          placeholder="Category"
          value={form.category}
          onChange={handleChange}
          required
        />

        <input
          name="price"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="Price (₹)"
          value={form.price}
          onChange={handleChange}
          required
        />

        <input
          name="stock"
          type="number"
          min="0"
          step="1"
          placeholder="Stock quantity"
          value={form.stock}
          onChange={handleChange}
          required
        />

        {error && (
          <p className="seller-error" role="alert">
            {error}
          </p>
        )}

        <div className="seller-form-actions">
          <button type="submit">
            {editingId !== null ? "Update Book" : "Add Book"}
          </button>

          {editingId !== null && (
            <button type="button" onClick={cancelEdit}>
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <h3>Your Demo Listings</h3>

      {books.length === 0 && <p>No books added yet.</p>}

      <div className="seller-book-list">
        {books.map((book) => (
          <div className="seller-book-item" key={book.id}>
            <div className="seller-book-details">
              <strong>{book.title}</strong>
              <p>
                {book.author} — {book.category}
              </p>
              <p>
                ₹{book.price} | Stock: {book.stock}
              </p>
            </div>

            <div className="seller-book-actions">
              <button type="button" onClick={() => editBook(book)}>
                Edit
              </button>

              <button
                type="button"
                className="seller-delete-button"
                onClick={() => deleteBook(book.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
