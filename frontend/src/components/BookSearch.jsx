import { useState } from "react";
import "./BookSearch.css";

const sampleBooks = [
  {
    id: 1,
    title: "Atomic Habits",
    author: "James Clear",
    category: "Self Help",
    price: 499,
  },
  {
    id: 2,
    title: "The Alchemist",
    author: "Paulo Coelho",
    category: "Fiction",
    price: 299,
  },
  {
    id: 3,
    title: "Wings of Fire",
    author: "A. P. J. Abdul Kalam",
    category: "Autobiography",
    price: 350,
  },
];

const STORAGE_KEY = "bookstore_demo_seller_books";

function readSellerBooks() {
  try {
    const books = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(books) ? books : [];
  } catch {
    return [];
  }
}

export default function BookSearch() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sellerBooks, setSellerBooks] = useState(readSellerBooks);

  function refreshBooks() {
    setSellerBooks(readSellerBooks());
  }

  const books = [...sampleBooks, ...sellerBooks];

  const categories = ["All", ...new Set(books.map((book) => book.category))];

  const filteredBooks = books.filter((book) => {
    const query = search.trim().toLowerCase();

    const matchesText =
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query) ||
      book.category.toLowerCase().includes(query);

    const matchesCategory = category === "All" || book.category === category;

    return matchesText && matchesCategory;
  });

  return (
    <section className="book-search">
      <h2>Search Books</h2>

      <input
        type="search"
        placeholder="Search title, author or category"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      <select
        value={category}
        onChange={(event) => setCategory(event.target.value)}
      >
        {categories.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      <button type="button" onClick={refreshBooks}>
        Refresh Seller Listings
      </button>

      <p>{filteredBooks.length} book(s) found</p>

      <div className="book-search-grid">
        {filteredBooks.map((book) => (
          <article className="book-search-card" key={book.id}>
            <h3>{book.title}</h3>
            <p>Author: {book.author}</p>
            <p>Category: {book.category}</p>
            <p>Price: ₹{book.price}</p>
          </article>
        ))}
      </div>

      {filteredBooks.length === 0 && <p>No books match your search.</p>}
    </section>
  );
}
