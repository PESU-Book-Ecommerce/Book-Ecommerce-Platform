
import { useEffect, useState } from "react";
import "./App.css";

import Auth from "./components/Auth";
import BookSearch from "./components/BookSearch";
import Cart from "./components/Cart";
import Payment from "./components/Payment";
import Reviews from "./components/Reviews";
import SellerBooks from "./components/SellerBooks";
import AdminDashboard from "./components/AdminDashboard";
import SellerDashboard from "./components/SellerDashboard";

import { addToCart } from "./services/cart";
import {
  createOrder,
  getMyOrders,
  getSellerOrders,
  updateOrderStatus,
} from "./services/orders";

const emptyAddress = {
  fullName: "",
  phone: "",
  addressLine: "",
  city: "",
  state: "",
  pincode: "",
};

function App() {
  const [session, setSession] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("bookstore_session")) || null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState("books");
  const [message, setMessage] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);
  const [checkout, setCheckout] = useState(false);
  const [address, setAddress] = useState(emptyAddress);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderError, setOrderError] = useState("");

  const user = session?.user;
  const token = session?.token;
  const role = user?.role;

  function handleAuthSuccess(data) {
    sessionStorage.setItem("bookstore_session", JSON.stringify(data));
    setSession(data);
    setActiveTab(data.user.role === "customer" ? "books" : "dashboard");
    setMessage("");
  }

  function handleLogout() {
    sessionStorage.removeItem("bookstore_session");
    setSession(null);
    setActiveTab("books");
    setSelectedBook(null);
    setCheckout(false);
    setCurrentOrder(null);
    setOrders([]);
    setMessage("");
  }

  async function handleAddToCart(bookId) {
    try {
      setMessage("");
      await addToCart(bookId, 1, token);
      setMessage("Book added to your cart successfully.");
    } catch (error) {
      setMessage(error.message || "Unable to add book to cart.");
    }
  }

  function openCheckout() {
    setCheckout(true);
    setActiveTab("checkout");
    setMessage("");
  }

  function handleAddressChange(event) {
    const { name, value } = event.target;
    setAddress((previous) => ({ ...previous, [name]: value }));
  }

  async function handlePlaceOrder(event) {
    event.preventDefault();

    try {
      setPlacingOrder(true);
      setMessage("");

      const result = await createOrder(address, token);

      if (!result.order?._id) {
        throw new Error("The server did not return a valid order.");
      }

      setCurrentOrder(result.order);
      setCheckout(false);
      setActiveTab("payment");
      setMessage(result.message || "Order placed successfully.");
    } catch (error) {
      setMessage(error.message || "Unable to place your order.");
    } finally {
      setPlacingOrder(false);
    }
  }

  async function loadOrders() {
    try {
      setOrdersLoading(true);
      setOrderError("");

      const result =
        role === "seller"
          ? await getSellerOrders(token)
          : await getMyOrders(token);

      setOrders(result.orders || []);
    } catch (error) {
      setOrderError(error.message || "Unable to load orders.");
    } finally {
      setOrdersLoading(false);
    }
  }

  useEffect(() => {
    if (
      token &&
      (activeTab === "orders" ||
        activeTab === "seller-orders" ||
        (activeTab === "dashboard" && role === "seller"))
    ) {
      loadOrders();
    }
  }, [activeTab, token]);

  async function handleOrderStatus(orderId, status) {
    try {
      await updateOrderStatus(orderId, status, token);
      setMessage("Order status updated.");
      await loadOrders();
    } catch (error) {
      setMessage(error.message || "Unable to update order status.");
    }
  }

  function renderCustomerContent() {
    if (activeTab === "books") {
      return (
        <>
          <section className="bookstore-hero">
            <div className="hero-copy">
              <span className="hero-eyebrow">
                THE WORLD OF BOOKS AWAITS YOU
              </span>

              <h2>Every book is a new adventure.</h2>

              <p>
                Discover captivating stories, timeless classics and inspiring
                reads. Find the next book that speaks to you.
              </p>

              <button
                className="hero-button"
                onClick={() =>
                  document.getElementById("book-collection")?.scrollIntoView({
                    behavior: "smooth",
                  })
                }
              >
                Explore Books →
              </button>

              <div className="hero-stats">
                <div>
                  <strong>READ</strong>
                  <span>Explore new worlds</span>
                </div>

                <div>
                  <strong>DISCOVER</strong>
                  <span>Find your next favourite</span>
                </div>
              </div>
            </div>

            <div className="hero-image">
              <div className="book-photo-grid">
                <img
                  className="book-photo book-photo-main"
                  src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=900&q=85"
                  alt="Collection of books"
                />

                <img
                  className="book-photo book-photo-top"
                  src="https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=85"
                  alt="Books arranged beautifully"
                />

                <img
                  className="book-photo book-photo-bottom"
                  src="https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600&q=85"
                  alt="Book collection"
                />
              </div>

              <div className="hero-floating-note">
                A WORLD OF STORIES
              </div>

              <div className="hero-image-caption">
                <span>THE JOY OF READING</span>
                <strong>One book. A thousand worlds.</strong>
              </div>
            </div>
          </section>

          <section className="reading-banner">
            <span>YOUR PERSONAL BOOKSTORE</span>
            <h2>Find stories worth remembering.</h2>
            <p>
              Browse our collection and let your next adventure begin.
            </p>
          </section>

          
          <BookSearch
            onAddToCart={handleAddToCart}
            onViewReviews={(book) => {
              setSelectedBook(book);
              setActiveTab("reviews");
            }}
          />
        </>
      );
    }

    if (activeTab === "cart") {
      return <Cart token={token} onCheckout={openCheckout} />;
    }

    if (activeTab === "checkout") {
      return (
        <section className="integration-panel">
          <h2>Checkout</h2>
          <p>Enter your delivery address to place your order.</p>

          <form className="checkout-form" onSubmit={handlePlaceOrder}>
            <input
              name="fullName"
              placeholder="Full name"
              value={address.fullName}
              onChange={handleAddressChange}
              required
            />

            <input
              name="phone"
              placeholder="10-digit phone number"
              value={address.phone}
              onChange={handleAddressChange}
              pattern="[0-9]{10}"
              maxLength="10"
              required
            />

            <textarea
              name="addressLine"
              placeholder="House number, street and area"
              value={address.addressLine}
              onChange={handleAddressChange}
              required
            />

            <input
              name="city"
              placeholder="City"
              value={address.city}
              onChange={handleAddressChange}
              required
            />

            <input
              name="state"
              placeholder="State"
              value={address.state}
              onChange={handleAddressChange}
              required
            />

            <input
              name="pincode"
              placeholder="6-digit PIN code"
              value={address.pincode}
              onChange={handleAddressChange}
              pattern="[0-9]{6}"
              maxLength="6"
              required
            />

            <button type="submit" disabled={placingOrder}>
              {placingOrder ? "Placing Order..." : "Place Order"}
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={() => setActiveTab("cart")}
            >
              Back to Cart
            </button>
          </form>
        </section>
      );
    }

    if (activeTab === "payment") {
      return currentOrder ? (
        <section className="integration-panel">
          <h2>Payment</h2>
          <p>Order ID: {currentOrder._id}</p>
          <p>Total amount: ₹{currentOrder.totalAmount}</p>

          <Payment orderId={currentOrder._id} token={token} />

          <button
            onClick={() => {
              setCurrentOrder(null);
              setActiveTab("orders");
            }}
          >
            Continue to My Orders
          </button>
        </section>
      ) : (
        <section className="integration-panel">
          <h2>No order selected</h2>
          <button onClick={() => setActiveTab("books")}>
            Browse Books
          </button>
        </section>
      );
    }

    if (activeTab === "orders") {
      return (
        <section className="integration-panel">
          <h2>My Orders</h2>

          <button onClick={loadOrders} disabled={ordersLoading}>
            {ordersLoading ? "Loading..." : "Refresh Orders"}
          </button>

          {orderError && <p role="alert">{orderError}</p>}

          {orders.length === 0 && !ordersLoading && (
            <p>You haven't placed any orders yet.</p>
          )}

          {orders.map((order) => (
            <article className="order-card" key={order._id}>
              <strong>Order #{order._id}</strong>

              <p>Total: ₹{order.totalAmount}</p>
              <p>Order status: {order.orderStatus}</p>
              <p>Payment status: {order.paymentStatus}</p>

              {order.items?.map((item, index) => (
                <p key={`${order._id}-${index}`}>
                  {item.title} × {item.quantity} — ₹
                  {item.price * item.quantity}
                </p>
              ))}
            </article>
          ))}
        </section>
      );
    }

    if (activeTab === "reviews") {
      return selectedBook ? (
        <section className="integration-panel">
          <button
            className="secondary-button"
            onClick={() => setActiveTab("books")}
          >
            Back to Books
          </button>

          <h2>{selectedBook.title}</h2>

          <Reviews bookId={selectedBook._id} token={token} />
        </section>
      ) : (
        <section className="integration-panel">
          <p>Select a book to view its reviews.</p>
        </section>
      );
    }

    return null;
  }

  function renderSellerContent() {
    if (activeTab === "dashboard") {
      return (
        <SellerDashboard
          user={user}
          token={token}
          orders={orders}
          ordersLoading={ordersLoading}
          orderError={orderError}
          onRefreshOrders={loadOrders}
          onNavigate={setActiveTab}
        />
      );
    }

    if (activeTab === "seller-books") {
      return <SellerBooks token={token} user={user} />;
    }

    if (activeTab === "seller-orders") {
      return (
        <section className="integration-panel">
          <h2>Customer Orders</h2>

          <button onClick={loadOrders} disabled={ordersLoading}>
            {ordersLoading ? "Loading..." : "Refresh Orders"}
          </button>

          {orderError && <p role="alert">{orderError}</p>}

          {orders.length === 0 && !ordersLoading && (
            <p>No seller orders found.</p>
          )}

          {orders.map((order) => (
            <article className="order-card" key={order._id}>
              <strong>Order #{order._id}</strong>

              <p>Customer: {order.userId?.name || "Customer"}</p>
              <p>Total: ₹{order.totalAmount}</p>
              <p>Order status: {order.orderStatus}</p>
              <p>Payment status: {order.paymentStatus}</p>

              {order.items?.map((item, index) => (
                <p key={`${order._id}-${index}`}>
                  {item.title} × {item.quantity}
                </p>
              ))}

              <div className="seller-status-actions">
                {["confirmed", "shipped", "delivered", "cancelled"].map(
                  (status) => (
                    <button
                      key={status}
                      type="button"
                      disabled={
                        String(order.orderStatus).toLowerCase() === status
                      }
                      onClick={() =>
                        handleOrderStatus(order._id, status)
                      }
                    >
                      Mark {status}
                    </button>
                  )
                )}
              </div>
            </article>
          ))}
        </section>
      );
    }

    return null;
  }

  if (!session || !token || !user) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="app">
      <header className="header">
        <div className="brand-area">
          <div className="brand-icon">B.</div>

          <div>
            <h1>The Book Nook</h1>

            <p className="welcome-text">
              WELCOME BACK, {user.name} · {role}
            </p>
          </div>
        </div>

        <button className="logout-button" onClick={handleLogout}>
          Logout ↪
        </button>
      </header>

      <nav className="dashboard-nav">
        {role === "customer" && (
          <>
            <button
              className={activeTab === "books" ? "active" : ""}
              onClick={() => setActiveTab("books")}
            >
              Discover Books
            </button>

            <button
              className={activeTab === "cart" ? "active" : ""}
              onClick={() => setActiveTab("cart")}
            >
              My Cart
            </button>

            <button
              className={activeTab === "orders" ? "active" : ""}
              onClick={() => setActiveTab("orders")}
            >
              My Orders
            </button>
          </>
        )}

        {role === "seller" && (
          <>
            <button
              className={activeTab === "dashboard" ? "active" : ""}
              onClick={() => setActiveTab("dashboard")}
            >
              Dashboard
            </button>

            <button
              className={activeTab === "seller-books" ? "active" : ""}
              onClick={() => setActiveTab("seller-books")}
            >
              My Books
            </button>

            <button
              className={activeTab === "seller-orders" ? "active" : ""}
              onClick={() => setActiveTab("seller-orders")}
            >
              Orders
            </button>
          </>
        )}

        {role === "admin" && (
          <button
            className={activeTab === "dashboard" ? "active" : ""}
            onClick={() => setActiveTab("dashboard")}
          >
            Admin Dashboard
          </button>
        )}
      </nav>

      {message && (
        <div className="app-message" role="status">
          {message}

          <button onClick={() => setMessage("")}>×</button>
        </div>
      )}

      <main className="dashboard-content">
        {role === "customer" && renderCustomerContent()}

        {role === "seller" && renderSellerContent()}

        {role === "admin" && activeTab === "dashboard" && (
          <AdminDashboard token={token} />
        )}

        {!["customer", "seller", "admin"].includes(role) && (
          <section className="integration-panel">
            <h2>Unsupported account role</h2>
            <p>Please contact the administrator.</p>
          </section>
        )}
      </main>

      <footer className="app-footer">
        <div className="footer-brand">The Book Nook.</div>

        <p>Where every page opens a new world.</p>

        <span>
          BOOK E-COMMERCE PLATFORM · SOFTWARE ENGINEERING PROJECT
        </span>
      </footer>
    </div>
  );
}

export default App;
