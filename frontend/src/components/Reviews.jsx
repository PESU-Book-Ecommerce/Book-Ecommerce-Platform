import { useEffect, useState } from "react";
import { getReviews, submitReview } from "../services/reviews";
import "./Shop.css";

export default function Reviews({ bookId, token }) {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    getReviews(bookId)
      .then((data) => {
        if (active) setReviews(data);
      })
      .catch((error) => {
        if (active) setMessage(error.message);
      });
    return () => {
      active = false;
    };
  }, [bookId]);

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      setLoading(true);
      setMessage("");
      await submitReview(bookId, Number(rating), comment, token);
      setComment("");
      setRating(5);
      setMessage("Thanks! Your review will appear once an administrator approves it.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  const average = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <section className="shop-panel">
      <h3>
        Ratings &amp; Reviews {average && <small>· {average} / 5 ({reviews.length})</small>}
      </h3>

      {reviews.length === 0 && <p>No reviews yet. Be the first to review this book.</p>}

      {reviews.map((review) => (
        <div className="shop-row" key={review._id}>
          <div className="shop-grow">
            <div>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</div>
            {review.comment && <p>{review.comment}</p>}
            <small>{new Date(review.createdAt).toLocaleDateString()}</small>
          </div>
        </div>
      ))}

      {token ? (
        <form onSubmit={handleSubmit} className="shop-form">
          <label htmlFor="review-rating">Rating</label>
          <select id="review-rating" value={rating} onChange={(e) => setRating(e.target.value)}>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>{n} star{n > 1 ? "s" : ""}</option>
            ))}
          </select>

          <label htmlFor="review-comment">Comment (optional)</label>
          <textarea
            id="review-comment"
            rows={3}
            maxLength={1000}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      ) : (
        <p>Please log in to write a review.</p>
      )}

      {message && <p role="status" className="shop-message">{message}</p>}
    </section>
  );
}
