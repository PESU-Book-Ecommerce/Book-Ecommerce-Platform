
import { useEffect, useMemo, useState } from "react";
import { getBooks } from "../services/books";
import "./SellerDashboard.css";

function SellerDashboard({
  user,
  token,
  orders = [],
  ordersLoading,
  orderError,
  onRefreshOrders,
  onNavigate,
}) {
  const [books, setBooks] = useState([]);
  const [booksLoading, setBooksLoading] = useState(true);
  const [bookError, setBookError] = useState("");

  async function loadBooks() {
    try {
      setBooksLoading(true);
      setBookError("");

      const result = await getBooks();
      const allBooks = result.books || [];
      const sellerId = user?.id || user?._id;

      const ownBooks = allBooks.filter((book) => {
        const bookSellerId = book.sellerId?._id || book.sellerId;
        return String(bookSellerId) === String(sellerId);
      });

      setBooks(ownBooks);
    } catch (error) {
      setBookError(error.message || "Unable to load your listings.");
    } finally {
      setBooksLoading(false);
    }
  }

  useEffect(() => {
    loadBooks();
  }, [user?.id, user?._id]);

  const stats = useMemo(() => {
    const totalStock = books.reduce(
      (total, book) => total + (Number(book.stock) || 0),
      0
    );

    const lowStock = books.filter(
      (book) => Number(book.stock) > 0 && Number(book.stock) <= 5
    ).length;

    const outOfStock = books.filter(
      (book) => Number(book.stock) <= 0
    ).length;

    const pendingOrders = orders.filter((order) =>
      ["pending", "placed"].includes(
        String(order.orderStatus || "").toLowerCase()
      )
    ).length;

    return {
      listings: books.length,
      totalStock,
      lowStock,
      outOfStock,
      totalOrders: orders.length,
      pendingOrders,
    };
  }, [books, orders]);

  const recentOrders = [...orders]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    )
    .slice(0, 4);

  function formatDate(date) {
    if (!date) return "Date unavailable";

    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "Date unavailable";

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="seller-dashboard">
      <section className="seller-dash-hero">
        <div className="seller-dash-hero-content">
          <span className="seller-dash-eyebrow">
            THE BOOK NOOK / SELLER STUDIO
          </span>

          <h1>
            Your business.
            <br />
            Your next chapter.
          </h1>

          <p>
            Welcome back, {user?.name || "Seller"}. Keep track of your
            bookstore, manage your inventory and stay on top of customer orders.
          </p>

          <div className="seller-dash-hero-actions">
            <button onClick={() => onNavigate("seller-books")}>
              + Add a New Book
            </button>
            <button
              className="seller-dash-outline-button"
              onClick={() => onNavigate("seller-orders")}
            >
              View Orders →
            </button>
          </div>
        </div>

        <div className="seller-dash-hero-visual" aria-hidden="true">
          <div className="seller-dash-orbit orbit-one" />
          <div className="seller-dash-orbit orbit-two" />
          <div className="seller-dash-book book-back">
            <span>STORIES</span>
          </div>
          <div className="seller-dash-book book-front">
            <small>THE ART OF</small>
            <strong>GREAT<br />STORIES</strong>
            <span>THE BOOK NOOK EDITION</span>
          </div>
          <div className="seller-dash-visual-caption">
            <span>01 / SELLER OVERVIEW</span>
            <strong>Build your collection.</strong>
          </div>
        </div>

        <div className="seller-dash-hero-bottom">
          <span>SELLER COMMAND CENTRE</span>
          <span>MANAGE · GROW · DISCOVER</span>
        </div>
      </section>

      <div className="seller-dash-section-heading">
        <div>
          <span>AT A GLANCE</span>
          <h2>Your business overview</h2>
        </div>
        <button
          className="seller-dash-refresh"
          onClick={() => {
            loadBooks();
            onRefreshOrders();
          }}
          disabled={booksLoading || ordersLoading}
        >
          ↻ Refresh overview
        </button>
      </div>

      {(bookError || orderError) && (
        <div className="seller-dash-error" role="alert">
          {bookError || orderError}
        </div>
      )}

      <section className="seller-dash-stats">
        <article className="seller-dash-stat stat-dark">
          <div className="seller-dash-stat-top">
            <span>MY LISTINGS</span>
            <span className="seller-dash-stat-icon">▤</span>
          </div>
          <strong>{booksLoading ? "—" : stats.listings}</strong>
          <p>Books in your catalogue</p>
          <span className="seller-dash-stat-foot">YOUR COLLECTION</span>
        </article>

        <article className="seller-dash-stat stat-cream">
          <div className="seller-dash-stat-top">
            <span>AVAILABLE STOCK</span>
            <span className="seller-dash-stat-icon">▥</span>
          </div>
          <strong>{booksLoading ? "—" : stats.totalStock}</strong>
          <p>Total copies in inventory</p>
          <span className="seller-dash-stat-foot">INVENTORY LEVEL</span>
        </article>

        <article className="seller-dash-stat stat-gold">
          <div className="seller-dash-stat-top">
            <span>CUSTOMER ORDERS</span>
            <span className="seller-dash-stat-icon">↗</span>
          </div>
          <strong>{ordersLoading ? "—" : stats.totalOrders}</strong>
          <p>{stats.pendingOrders} pending or placed</p>
          <span className="seller-dash-stat-foot">ORDER ACTIVITY</span>
        </article>

        <article className="seller-dash-stat stat-alert">
          <div className="seller-dash-stat-top">
            <span>STOCK ALERTS</span>
            <span className="seller-dash-stat-icon">!</span>
          </div>
          <strong>
            {booksLoading ? "—" : stats.lowStock + stats.outOfStock}
          </strong>
          <p>{stats.lowStock} low · {stats.outOfStock} out of stock</p>
          <span className="seller-dash-stat-foot">NEEDS ATTENTION</span>
        </article>
      </section>

      <section className="seller-dash-main-grid">
        <article className="seller-dash-panel inventory-panel">
          <div className="seller-dash-panel-heading">
            <div>
              <span>INVENTORY HEALTH</span>
              <h2>Stock at a glance</h2>
            </div>
            <span className="seller-dash-panel-symbol">◫</span>
          </div>

          {booksLoading ? (
            <p className="seller-dash-muted">Loading your inventory...</p>
          ) : books.length === 0 ? (
            <div className="seller-dash-empty">
              <span>▤</span>
              <strong>Your bookshelf is waiting.</strong>
              <p>Add your first book to start building your catalogue.</p>
              <button onClick={() => onNavigate("seller-books")}>
                Add your first book
              </button>
            </div>
          ) : (
            <>
              <div className="inventory-total">
                <strong>{stats.listings}</strong>
                <span>listed titles</span>
              </div>

              <div className="inventory-bar">
                <span
                  className="inventory-bar-available"
                  style={{
                    width: `${
                      (books.filter((book) => Number(book.stock) > 5).length /
                        books.length) *
                      100
                    }%`,
                  }}
                />
                <span
                  className="inventory-bar-low"
                  style={{
                    width: `${
                      (stats.lowStock / books.length) * 100
                    }%`,
                  }}
                />
                <span
                  className="inventory-bar-empty"
                  style={{
                    width: `${
                      (stats.outOfStock / books.length) * 100
                    }%`,
                  }}
                />
              </div>

              <div className="inventory-legend">
                <div><i className="legend-available" /> Healthy stock <strong>{books.filter((book) => Number(book.stock) > 5).length}</strong></div>
                <div><i className="legend-low" /> Low stock <strong>{stats.lowStock}</strong></div>
                <div><i className="legend-empty" /> Out of stock <strong>{stats.outOfStock}</strong></div>
              </div>
            </>
          )}

          <button
            className="seller-dash-text-link"
            onClick={() => onNavigate("seller-books")}
          >
            Manage all listings →
          </button>
        </article>

        <article className="seller-dash-panel attention-panel">
          <div className="seller-dash-panel-heading">
            <div>
              <span>TAKE ACTION</span>
              <h2>Business essentials</h2>
            </div>
            <span className="seller-dash-panel-symbol">✳</span>
          </div>

          <button
            className="seller-dash-action"
            onClick={() => onNavigate("seller-books")}
          >
            <span className="action-icon">＋</span>
            <span><strong>Add a new book</strong><small>Expand your bookstore collection</small></span>
            <b>→</b>
          </button>

          <button
            className="seller-dash-action"
            onClick={() => onNavigate("seller-books")}
          >
            <span className="action-icon">▤</span>
            <span><strong>Manage inventory</strong><small>Review titles and available stock</small></span>
            <b>→</b>
          </button>

          <button
            className="seller-dash-action"
            onClick={() => onNavigate("seller-orders")}
          >
            <span className="action-icon">↗</span>
            <span><strong>Process customer orders</strong><small>Review and update order status</small></span>
            <b>→</b>
          </button>
        </article>
      </section>

      <section className="seller-dash-panel recent-orders-panel">
        <div className="seller-dash-panel-heading">
          <div>
            <span>YOUR STORE ACTIVITY</span>
            <h2>Recent customer orders</h2>
          </div>
          <button
            className="seller-dash-text-link"
            onClick={() => onNavigate("seller-orders")}
          >
            View all orders →
          </button>
        </div>

        {ordersLoading ? (
          <p className="seller-dash-muted">Loading orders...</p>
        ) : recentOrders.length === 0 ? (
          <div className="seller-dash-no-orders">
            <span>✧</span>
            <div>
              <strong>No customer orders yet</strong>
              <p>When customers order your books, their activity will appear here.</p>
            </div>
          </div>
        ) : (
          <div className="seller-dash-order-list">
            {recentOrders.map((order) => (
              <div className="seller-dash-order-row" key={order._id}>
                <div className="seller-dash-order-icon">B.</div>
                <div className="seller-dash-order-info">
                  <strong>Order #{String(order._id).slice(-7)}</strong>
                  <span>{order.userId?.name || "Customer"} · {formatDate(order.createdAt)}</span>
                </div>
                <div className="seller-dash-order-amount">
                  ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
                </div>
                <span className={`seller-dash-order-status status-${String(order.orderStatus || "pending").toLowerCase()}`}>
                  {order.orderStatus || "Pending"}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="seller-dash-footer-note">
        <span>THE BOOK NOOK</span>
        <p>Every great bookstore begins with a single story.</p>
      </div>
    </div>
  );
}

export default SellerDashboard;
