import { useEffect, useState } from "react";
import {
  getUsers,
  getBooks,
  deleteBook,
  getPendingReviews,
  approveReview,
} from "../services/admin";
import "./Shop.css";

export default function AdminDashboard({ token }) {
  const [tab, setTab] = useState("books");
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [message, setMessage] = useState("");

  const [version, setVersion] = useState(0);
  const load = () => setVersion((v) => v + 1);

  useEffect(() => {
    let active = true;
    Promise.all([getUsers(token), getBooks(token), getPendingReviews(token)])
      .then(([u, b, r]) => {
        if (!active) return;
        setUsers(u);
        setBooks(b);
        setReviews(r);
        setMessage("");
      })
      .catch((error) => {
        if (active) setMessage(error.message);
      });
    return () => {
      active = false;
    };
  }, [token, version]);

  async function handleDelete(book) {
    if (!window.confirm(`Delete "${book.title}"? This cannot be undone.`)) return;
    try {
      await deleteBook(book._id, token);
      load();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handleApprove(reviewId) {
    try {
      await approveReview(reviewId, token);
      load();
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <section className="shop-panel">
      <h2>Admin Dashboard</h2>

      <div className="shop-tabs">
        <button onClick={() => setTab("books")} disabled={tab === "books"}>
          Books ({books.length})
        </button>
        <button onClick={() => setTab("users")} disabled={tab === "users"}>
          Users ({users.length})
        </button>
        <button onClick={() => setTab("reviews")} disabled={tab === "reviews"}>
          Pending Reviews ({reviews.length})
        </button>
      </div>

      {tab === "books" &&
        books.map((book) => (
          <div className="shop-row" key={book._id}>
            <div className="shop-grow">
              <strong>{book.title}</strong> by {book.author} · ₹{book.price} · stock {book.stock}
            </div>
            <button className="shop-danger" onClick={() => handleDelete(book)}>
              Delete
            </button>
          </div>
        ))}

      {tab === "users" &&
        users.map((user) => (
          <div className="shop-row" key={user._id}>
            <div className="shop-grow">
              <strong>{user.name}</strong> · {user.email}
            </div>
            <span>{user.role}</span>
          </div>
        ))}

      {tab === "reviews" && (
        <>
          {reviews.length === 0 && <p>No reviews awaiting approval.</p>}
          {reviews.map((review) => (
            <div className="shop-row" key={review._id}>
              <div className="shop-grow">
                <strong>{review.bookId?.title || "Unknown book"}</strong> ·{" "}
                {"★".repeat(review.rating)} by {review.userId?.name || "Unknown"}
                <p>{review.comment}</p>
              </div>
              <button onClick={() => handleApprove(review._id)}>Approve</button>
            </div>
          ))}
        </>
      )}

      {message && <p role="status" className="shop-message">{message}</p>}
    </section>
  );
}
