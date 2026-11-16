
import { useEffect, useState } from "react";
import {
  createBook,
  getBooks,
  updateBook,
  deleteBook,
} from "../services/books";
import "./SellerBooks.css";

const emptyForm = {
  title: "",
  author: "",
  description: "",
  category: "",
  price: "",
  stock: "",
  image: "",
};

export default function SellerBooks({ token, user }) {
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(true);
  const [editingBookId, setEditingBookId] = useState(null);

  async function loadBooks() {
    try {
      setLoading(true);
      setError("");

      const data = await getBooks();
      const allBooks = Array.isArray(data) ? data : data.books || [];

      const ownBooks = allBooks.filter((book) => {
        const sellerId = book.sellerId?._id || book.sellerId;

        return (
          sellerId &&
          user?.id &&
          String(sellerId) === String(user.id)
        );
      });

      setBooks(ownBooks);
    } catch (err) {
      setError(err.message || "Unable to load your listings.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token && user?.id) {
      loadBooks();
    }
  }, [token, user?.id]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function startEditing(book) {
    setEditingBookId(book._id);

    setForm({
      title: book.title || "",
      author: book.author || "",
      description: book.description || "",
      category: book.category || "",
      price: String(book.price ?? ""),
      stock: String(book.stock ?? ""),
      image: book.image || "",
    });

    setShowForm(true);
    setMessage("");
    setError("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEditing() {
    setEditingBookId(null);
    setForm(emptyForm);
    setShowForm(false);
    setError("");
    setMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setMessage("");

    const title = form.title.trim();
    const author = form.author.trim();
    const price = Number(form.price);
    const stock = Number(form.stock);

    if (!title || !author) {
      setError("Please enter the book title and author.");
      return;
    }

    if (
      form.price.trim() === "" ||
      !Number.isFinite(price) ||
      price <= 0
    ) {
      setError("Price must be greater than zero.");
      return;
    }

    if (
      form.stock.trim() === "" ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      setError("Stock must be a non-negative whole number.");
      return;
    }

    const bookData = {
      title,
      author,
      description: form.description.trim(),
      category: form.category.trim() || "General",
      price,
      stock,
      image: form.image.trim(),
    };

    try {
      setSaving(true);

      if (editingBookId) {
        await updateBook(editingBookId, bookData, token);
        setMessage("Book updated successfully!");
      } else {
        await createBook(bookData, token);
        setMessage("Book added successfully!");
      }

      setForm(emptyForm);
      setEditingBookId(null);
      setShowForm(false);

      await loadBooks();
    } catch (err) {
      setError(err.message || "Unable to save book.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(book) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${book.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await deleteBook(book._id, token);

      if (editingBookId === book._id) {
        setEditingBookId(null);
        setForm(emptyForm);
      }

      setMessage("Book deleted successfully!");
      await loadBooks();
    } catch (err) {
      setError(err.message || "Unable to delete book.");
    }
  }

  const totalStock = books.reduce(
    (total, book) => total + (Number(book.stock) || 0),
    0
  );

  const lowStock = books.filter(
    (book) => Number(book.stock) > 0 && Number(book.stock) <= 5
  ).length;

  const outOfStock = books.filter(
    (book) => Number(book.stock) === 0
  ).length;

  return (
    <section className="seller-studio">

      <div className="seller-hero">
        <div className="seller-hero-content">
          <span className="seller-eyebrow">
            YOUR BUSINESS WORKSPACE
          </span>

          <h2>Seller Studio</h2>

          <p>
            Welcome back, {user?.name || "Seller"}.
            Manage your bookstore, grow your collection
            and keep track of your inventory.
          </p>

          <button
            type="button"
            className="seller-hero-button"
            onClick={() => {
              setEditingBookId(null);
              setForm(emptyForm);
              setShowForm(true);
              setMessage("");
              setError("");
            }}
          >
            + Add a New Book
          </button>
        </div>

        <div className="seller-hero-art">
          <div className="seller-art-circle"></div>
          <div className="seller-art-book book-one">BOOKS</div>
          <div className="seller-art-book book-two">STORIES</div>
          <div className="seller-art-book book-three">IDEAS</div>
        </div>
      </div>

      <div className="seller-section-heading">
        <div>
          <span className="seller-eyebrow">BUSINESS OVERVIEW</span>
          <h3>Your Inventory at a Glance</h3>
        </div>

        <button
          type="button"
          className="seller-refresh"
          onClick={loadBooks}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "↻ Refresh"}
        </button>
      </div>

      <div className="seller-stats">
        <article className="seller-stat-card">
          <div className="seller-stat-icon navy-icon">▤</div>
          <div>
            <span>Total Listings</span>
            <strong>{books.length}</strong>
            <small>Books in your catalogue</small>
          </div>
        </article>

        <article className="seller-stat-card">
          <div className="seller-stat-icon gold-icon">▣</div>
          <div>
            <span>Total Stock</span>
            <strong>{totalStock}</strong>
            <small>Available book copies</small>
          </div>
        </article>

        <article className="seller-stat-card">
          <div className="seller-stat-icon green-icon">✓</div>
          <div>
            <span>Low Stock</span>
            <strong>{lowStock}</strong>
            <small>Books with 1–5 copies</small>
          </div>
        </article>

        <article className="seller-stat-card">
          <div className="seller-stat-icon red-icon">!</div>
          <div>
            <span>Out of Stock</span>
            <strong>{outOfStock}</strong>
            <small>Books needing restock</small>
          </div>
        </article>
      </div>

      {showForm && (
        <div className="seller-form-panel">
          <div className="seller-panel-heading">
            <div>
              <span className="seller-eyebrow">
                {editingBookId ? "UPDATE YOUR CATALOGUE" : "GROW YOUR CATALOGUE"}
              </span>

              <h3>
                {editingBookId ? "Edit Book Listing" : "Add a New Book"}
              </h3>

              <p>
                {editingBookId
                  ? "Update the details of your selected book."
                  : "Enter the details below to publish a new listing."}
              </p>
            </div>

            <button
              type="button"
              className="seller-close-form"
              onClick={cancelEditing}
              aria-label="Close form"
            >
              ×
            </button>
          </div>

          <form className="seller-new-book-form" onSubmit={handleSubmit}>
            <div className="seller-field">
              <label htmlFor="seller-title">Book Title *</label>
              <input
                id="seller-title"
                name="title"
                placeholder="e.g. Atomic Habits"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="seller-field">
              <label htmlFor="seller-author">Author *</label>
              <input
                id="seller-author"
                name="author"
                placeholder="Author name"
                value={form.author}
                onChange={handleChange}
                required
              />
            </div>

            <div className="seller-field">
              <label htmlFor="seller-category">Category</label>
              <input
                id="seller-category"
                name="category"
                placeholder="e.g. Self Help"
                value={form.category}
                onChange={handleChange}
              />
            </div>

            <div className="seller-field">
              <label htmlFor="seller-price">Price (₹) *</label>
              <input
                id="seller-price"
                name="price"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Enter price"
                value={form.price}
                onChange={handleChange}
                required
              />
            </div>

            <div className="seller-field">
              <label htmlFor="seller-stock">Stock Quantity *</label>
              <input
                id="seller-stock"
                name="stock"
                type="number"
                min="0"
                step="1"
                placeholder="Number of copies"
                value={form.stock}
                onChange={handleChange}
                required
              />
            </div>

            <div className="seller-field seller-full-field">
              <label htmlFor="seller-image">Book Cover Image URL</label>
              <input
                id="seller-image"
                name="image"
                type="url"
                placeholder="https://example.com/book-cover.jpg"
                value={form.image}
                onChange={handleChange}
              />
            </div>

            <div className="seller-field seller-full-field">
              <label htmlFor="seller-description">Book Description</label>
              <textarea
                id="seller-description"
                name="description"
                placeholder="Write a short description about the book..."
                value={form.description}
                onChange={handleChange}
                rows="4"
              />
            </div>

            {error && (
              <p className="seller-error" role="alert">{error}</p>
            )}

            <div className="seller-form-actions seller-full-field">
              <button type="submit" disabled={saving}>
                {saving
                  ? "Saving..."
                  : editingBookId
                  ? "Save Changes"
                  : "Publish Book Listing"}
              </button>

              <button
                type="button"
                className="seller-clear-button"
                onClick={() => {
                  if (editingBookId) {
                    cancelEditing();
                  } else {
                    setForm(emptyForm);
                  }
                }}
              >
                {editingBookId ? "Cancel Edit" : "Clear Form"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="seller-inventory">
        <div className="seller-section-heading">
          <div>
            <span className="seller-eyebrow">YOUR BOOKSTORE</span>
            <h3>Manage Your Listings</h3>
            <p>All books associated with your seller account.</p>
          </div>
        </div>

        {message && (
          <p className="seller-success" role="status">{message}</p>
        )}

        {error && !showForm && (
          <p className="seller-error" role="alert">{error}</p>
        )}

        {loading && <p className="seller-empty">Loading your inventory...</p>}

        {!loading && books.length === 0 && (
          <div className="seller-empty-state">
            <div className="seller-empty-icon">▤</div>
            <h4>Your inventory is waiting!</h4>
            <p>You haven't published any books yet. Add your first book to get started.</p>
            <button
              type="button"
              onClick={() => setShowForm(true)}
            >
              Add Your First Book
            </button>
          </div>
        )}

        <div className="seller-inventory-grid">
          {books.map((book) => (
            <article className="seller-inventory-card" key={book._id}>
              <div className="seller-inventory-cover">
                {book.image ? (
                  <img src={book.image} alt={book.title} />
                ) : (
                  <div className="seller-cover-placeholder">
                    <span>BOOK</span>
                    <strong>{book.title}</strong>
                    <small>{book.author}</small>
                  </div>
                )}
              </div>

              <div className="seller-inventory-info">
                <span className="seller-category">
                  {book.category || "General"}
                </span>

                <h4>{book.title}</h4>
                <p className="seller-author">by {book.author}</p>

                <div className="seller-inventory-bottom">
                  <strong>₹{book.price}</strong>

                  <span
                    className={
                      Number(book.stock) === 0
                        ? "stock-badge stock-empty"
                        : Number(book.stock) <= 5
                        ? "stock-badge stock-low"
                        : "stock-badge stock-available"
                    }
                  >
                    {Number(book.stock) === 0
                      ? "Out of stock"
                      : `${book.stock} in stock`}
                  </span>
                </div>

                <div className="seller-book-actions">
                  <button
                    type="button"
                    className="seller-edit-button"
                    onClick={() => startEditing(book)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="seller-delete-button"
                    onClick={() => handleDelete(book)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
