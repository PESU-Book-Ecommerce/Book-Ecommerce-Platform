import { useEffect, useState } from "react";
import {
  getCart,
  updateQuantity,
  removeFromCart,
  validateCart,
} from "../services/cart";
import "./Shop.css";

export default function Cart({ token, onCheckout }) {
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [version, setVersion] = useState(0);
  const loadCart = () => setVersion((v) => v + 1);

  useEffect(() => {
    let active = true;
    getCart(token)
      .then((data) => {
        if (active) setItems(Array.isArray(data.cart) ? [] : data.cart.items || []);
      })
      .catch((error) => {
        if (active) setMessage(error.message);
      });
    return () => {
      active = false;
    };
  }, [token, version]);

  async function handleQuantity(bookId, quantity) {
    if (quantity < 1) return;
    try {
      setMessage("");
      await updateQuantity(bookId, quantity, token);
      loadCart();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handleRemove(bookId) {
    try {
      setMessage("");
      await removeFromCart(bookId, token);
      loadCart();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handleCheckout() {
    try {
      setLoading(true);
      setMessage("");
      const result = await validateCart(token);
      setMessage(`Cart validated. Total payable: ₹${result.totalAmount}`);
      if (onCheckout) onCheckout(result);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  // Display-only total; the server recalculates it during validation
  const total = items.reduce(
    (sum, item) => sum + (item.bookId?.price || 0) * item.quantity,
    0
  );

  return (
    <section className="shop-panel">
      <h2>Your Cart</h2>

      {items.length === 0 && <p>Your cart is empty.</p>}

      {items.map((item) => {
        const book = item.bookId;
        if (!book) return null;
        return (
          <div className="shop-row" key={book._id}>
            <div className="shop-grow">
              <strong>{book.title}</strong>
              <div>₹{book.price} each · {book.stock} in stock</div>
            </div>

            <div className="shop-qty">
              <button onClick={() => handleQuantity(book._id, item.quantity - 1)}>−</button>
              <span>{item.quantity}</span>
              <button
                onClick={() => handleQuantity(book._id, item.quantity + 1)}
                disabled={item.quantity >= book.stock}
              >
                +
              </button>
            </div>

            <div className="shop-subtotal">₹{book.price * item.quantity}</div>
            <button className="shop-danger" onClick={() => handleRemove(book._id)}>
              Remove
            </button>
          </div>
        );
      })}

      {items.length > 0 && (
        <div className="shop-footer">
          <strong>Total: ₹{total}</strong>
          <button onClick={handleCheckout} disabled={loading}>
            {loading ? "Validating..." : "Proceed to Checkout"}
          </button>
        </div>
      )}

      {message && <p role="status" className="shop-message">{message}</p>}
    </section>
  );
}
