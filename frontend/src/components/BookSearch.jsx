
import { useEffect, useState } from "react";
import { getBooks } from "../services/books";
import "./BookSearch.css";

export default function BookSearch({ onAddToCart, onViewReviews }) {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadBooks() {
    try {
      setLoading(true);
      setError("");

      const data = await getBooks();
      setBooks(Array.isArray(data) ? data : data.books || []);
    } catch (err) {
      setError(err.message || "Unable to load books.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBooks();
  }, []);

  const categories = [
    "All",
    ...new Set(books.map((book) => book.category || "General")),
  ];

  const query = search.trim().toLowerCase();

  const filteredBooks = books.filter((book) => {
    const matchesText =
      (book.title || "").toLowerCase().includes(query) ||
      (book.author || "").toLowerCase().includes(query) ||
      (book.category || "").toLowerCase().includes(query);

    const matchesCategory =
      category === "All" || (book.category || "General") === category;

    return matchesText && matchesCategory;
  });

  return (
    <section className="book-search">
      <div className="catalogue-toolbar">
        <div className="catalogue-search-box">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            placeholder="Search by book title, author or category..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search books"
          />
        </div>

        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          aria-label="Filter by category"
        >
          {categories.map((item) => (
            <option key={item} value={item}>
              {item === "All" ? "All Categories" : item}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="catalogue-refresh"
          onClick={loadBooks}
          disabled={loading}
        >
          {loading ? "Loading..." : "↻ Refresh"}
        </button>
      </div>

      <div className="catalogue-results">
        <span>
          {loading ? "Discovering books..." : `${filteredBooks.length} books found`}
        </span>
        <span className="catalogue-results-note">
          A little something for every reader
        </span>
      </div>

      {error && (
        <p className="catalogue-error" role="alert">
          {error}
        </p>
      )}

      {loading && (
        <div className="catalogue-empty">
          <span className="catalogue-empty-icon">📚</span>
          <h3>Opening the bookshelf...</h3>
          <p>Please wait while we find your books.</p>
        </div>
      )}

      {!loading && !error && filteredBooks.length > 0 && (
        <div className="book-search-grid">
          {filteredBooks.map((book, index) => {
            const inStock = Number(book.stock) > 0;

            return (
              <article className="book-search-card" key={book._id}>
                <div className="book-cover">
                  <div className={`book-cover-placeholder cover-theme-${index % 5}`}>
                    <span className="cover-small-label">THE BOOK NOOK</span>
                    <span className="cover-ornament">✦</span>
                    <strong>{book.title}</strong>
                    <span className="cover-author">{book.author}</span>
                    <span className="cover-bottom-line">A STORY TO DISCOVER</span>
                  </div>

                  {book.image && (
                    <img
                      className="book-cover-image"
                      src={book.image}
                      alt={`Cover of ${book.title}`}
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  )}

                  <span
                    className={`book-stock-badge ${inStock ? "" : "out-of-stock"}`}
                  >
                    {inStock ? "In Stock" : "Sold Out"}
                  </span>
                </div>

                <div className="book-card-content">
                  <span className="book-category">
                    {book.category || "General"}
                  </span>

                  <h3>{book.title}</h3>

                  <p className="book-author">
                    By {book.author || "Unknown Author"}
                  </p>

                  <div className="book-card-bottom">
                    <div>
                      <span className="book-price-label">PRICE</span>
                      <strong className="book-price">₹{book.price}</strong>
                    </div>

                    <span className="book-stock-count">
                      {inStock ? `${book.stock} available` : "Unavailable"}
                    </span>
                  </div>

                  {onAddToCart && (
                    <button
                      type="button"
                      className="book-add-button"
                      disabled={!inStock}
                      onClick={() => onAddToCart(book._id)}
                    >
                      {inStock ? "Add to Cart  →" : "Out of Stock"}
                    </button>
                  )}

                  {onViewReviews && (
                    <button
                      type="button"
                      className="book-review-button"
                      onClick={() => onViewReviews(book)}
                    >
                      ☆ Read Customer Reviews
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {!loading && !error && filteredBooks.length === 0 && (
        <div className="catalogue-empty">
          <span className="catalogue-empty-icon">📖</span>
          <h3>No books found</h3>
          <p>Try another title, author or category.</p>

          <button
            type="button"
            className="catalogue-refresh"
            onClick={() => {
              setSearch("");
              setCategory("All");
            }}
          >
            Show All Books
          </button>
        </div>
      )}
    </section>
  );
}
