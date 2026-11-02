
import { useEffect, useState } from "react";
import API_BASE from "../services/api";

function Cart({ token }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function loadCart() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE}/api/cart/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load cart");
      }

      const cartItems = Array.isArray(data.cart)
        ? data.cart
        : data.cart?.items || [];

      setItems(cartItems);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function removeBook(bookId) {
    try {
      const response = await fetch(
        `${API_BASE}/api/cart/remove/${bookId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to remove book");
      }

      setMessage("Book removed successfully.");
      await loadCart();
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    if (token) loadCart();
  }, [token]);

  return (
    <section className="shopping-cart">
      <h2>Shopping Cart</h2>

      {loading && <p>Loading cart...</p>}
      {error && <p>{error}</p>}
      {message && <p>{message}</p>}

      {!loading && items.length === 0 && (
        <p>Your cart is empty.</p>
      )}

      {items.map((item) => {
        const book = item.bookId;

        if (!book || typeof book !== "object") return null;

        return (
          <div className="cart-item" key={book._id}>
            <h3>{book.title}</h3>
            <p>Price: ₹{book.price}</p>
            <p>Quantity: {item.quantity}</p>
            <p>
              Subtotal: ₹{book.price * item.quantity}
            </p>

            <button onClick={() => removeBook(book._id)}>
              Remove
            </button>
          </div>
        );
      })}

      <button onClick={loadCart}>Refresh Cart</button>
    </section>
  );
}

export default Cart;
