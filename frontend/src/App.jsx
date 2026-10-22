
import { useState } from "react";
import "./App.css";

const books = [
  {
    id: 1,
    title: "Atomic Habits",
    author: "James Clear",
    price: 499,
    category: "Self-Help",
    description:
      "A practical guide to building good habits through small, consistent improvements.",
    stock: 10,
  },
  {
    id: 2,
    title: "The Alchemist",
    author: "Paulo Coelho",
    price: 299,
    category: "Fiction",
    description:
      "A novel about a young shepherd who follows his dreams and discovers the importance of his personal journey.",
    stock: 8,
  },
  {
    id: 3,
    title: "Wings of Fire",
    author: "A. P. J. Abdul Kalam",
    price: 350,
    category: "Autobiography",
    description:
      "The inspiring life story of Dr. A. P. J. Abdul Kalam, from his childhood to his scientific achievements.",
    stock: 5,
  },
];

function App() {
  const [search, setSearch] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);

  const filteredBooks = books.filter((book) =>
    `${book.title} ${book.author}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="app">
      <header className="header">
        <h1>Book E-Commerce Platform</h1>
        <nav>
          <a href="#books" onClick={() => setSelectedBook(null)}>
            Books
          </a>
          <a href="#about">About</a>
        </nav>
      </header>

      {selectedBook ? (
        <main className="book-details">
          <button
            className="back-button"
            onClick={() => setSelectedBook(null)}
          >
            ← Back to Books
          </button>

          <div className="details-card">
            <div className="details-icon">📚</div>

            <div>
              <h2>{selectedBook.title}</h2>
              <p><strong>Author:</strong> {selectedBook.author}</p>
              <p><strong>Category:</strong> {selectedBook.category}</p>
              <p><strong>Price:</strong> ₹{selectedBook.price}</p>
              <p>
                <strong>Availability:</strong>{" "}
                {selectedBook.stock > 0
                  ? `In Stock (${selectedBook.stock} available)`
                  : "Out of Stock"}
              </p>

              <h3>Description</h3>
              <p>{selectedBook.description}</p>
            </div>
          </div>
        </main>
      ) : (
        <>
          <section className="hero">
            <h2>Find Your Next Favourite Book</h2>
            <p>Explore books from different authors and categories.</p>
            <input
              type="text"
              placeholder="Search books by title or author..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </section>

          <main id="books">
            <h2>Available Books</h2>

            <div className="book-grid">
              {filteredBooks.map((book) => (
                <article className="book-card" key={book.id}>
                  <div className="book-icon">📚</div>
                  <h3>{book.title}</h3>
                  <p>By {book.author}</p>
                  <strong>₹{book.price}</strong>

                  <button
                    onClick={() => setSelectedBook(book)}
                  >
                    View Details
                  </button>
                </article>
              ))}
            </div>

            {filteredBooks.length === 0 && (
              <p>No books found.</p>
            )}
          </main>
        </>
      )}

      <footer id="about">
        <p>
          Book E-Commerce Platform — Software Engineering Project
        </p>
      </footer>
    </div>
  );
}

export default App;
