
import { useState } from "react";
import "./Auth.css";

const USERS_KEY = "bookstore_demo_users";
const SESSION_KEY = "bookstore_demo_session";

const initialForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "customer",
};

function getUsers() {
  try {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    return Array.isArray(users) ? users : [];
  } catch {
    return [];
  }
}

function BookIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 7v14" />
      <path d="M12 7C9.5 4.5 5.5 4 2 5v14c4-1 7.5-.5 10 2" />
      <path d="M12 7c2.5-2.5 6.5-3 10-2v14c-4-1-7.5-.5-10 2" />
      <path d="M5 8.5c2-.3 3.8.1 5.2 1" />
      <path d="M19 8.5c-2-.3-3.8.1-5.2 1" />
    </svg>
  );
}

function EyeIcon({ visible }) {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {visible ? (
        <>
          <path d="M3 3l18 18" />
          <path d="M10.6 10.6a2 2 0 002.8 2.8" />
          <path d="M9.9 5.2A11 11 0 0112 5c5.5 0 9 7 9 7a15 15 0 01-3.1 3.9" />
          <path d="M6.2 6.2C3.9 7.8 3 12 3 12s3.5 7 9 7a10 10 0 004-.8" />
        </>
      ) : (
        <>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  );
}

export default function Auth() {
  const [mode, setMode] = useState("register");
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
    } catch {
      return null;
    }
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function changeMode(nextMode) {
    setMode(nextMode);
    setForm(initialForm);
    setMessage("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  }

  function handleSubmit(event) {
    event.preventDefault();

    const email = form.email.trim().toLowerCase();
    const users = getUsers();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage("Please enter a valid email address.");
      return;
    }

    if (mode === "register") {
      if (form.name.trim().length < 2) {
        setMessage("Username must contain at least 2 characters.");
        return;
      }

      if (form.password.length < 8) {
        setMessage("Password must contain at least 8 characters.");
        return;
      }

      if (form.password !== form.confirmPassword) {
        setMessage("Passwords do not match.");
        return;
      }

      if (users.some((user) => user.email === email)) {
        setMessage("This email is already registered.");
        return;
      }

      // Demo only. Do not store real passwords in browser storage.
      const newUser = {
        id: Date.now(),
        name: form.name.trim(),
        email,
        password: form.password,
        role: form.role,
      };

      localStorage.setItem(
        USERS_KEY,
        JSON.stringify([...users, newUser])
      );

      setMessage("Account created successfully. Please log in.");
      setMode("login");
      setForm({
        ...initialForm,
        email,
      });
      setShowPassword(false);
      setShowConfirmPassword(false);
      return;
    }

    const matchedUser = users.find(
      (user) =>
        user.email === email &&
        user.password === form.password
    );

    if (!matchedUser) {
      setMessage("Invalid email or password.");
      return;
    }

    const session = {
      id: matchedUser.id,
      name: matchedUser.name,
      email: matchedUser.email,
      role: matchedUser.role,
    };

    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setCurrentUser(session);
    setMessage("");
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
    setMode("login");
    setForm(initialForm);
    setMessage("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  }

  if (currentUser) {
    return (
      <main className="auth-page">
        <section className="auth-container auth-dashboard">
          <div
            className="auth-brand-mark"
            role="img"
            aria-label="Open book logo"
          >
            <BookIcon />
          </div>

          <h2>Welcome, {currentUser.name}!</h2>
          <p>You are signed in to your bookstore account.</p>

          <div className="account-details">
            <p>
              <strong>Email:</strong> {currentUser.email}
            </p>
            <p>
              <strong>Account type:</strong> {currentUser.role}
            </p>
          </div>

          <button
            className="auth-primary"
            type="button"
            onClick={logout}
          >
            Logout
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <section className="auth-container">
        <div
          className="auth-brand-mark"
          role="img"
          aria-label="Open book logo"
        >
          <BookIcon />
        </div>

        <header className="auth-header">
          <h2>{mode === "register" ? "Sign Up" : "Login"}</h2>

          <p>
            {mode === "register"
              ? "Please fill in this form to create an account!"
              : "Welcome back! Log in to your bookstore account."}
          </p>
        </header>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "register" && (
            <>
              <label className="sr-only" htmlFor="auth-name">
                Username
              </label>

              <div className="auth-input-row">
                <span className="auth-input-icon" aria-hidden="true">
                  ♟
                </span>

                <input
                  id="auth-name"
                  name="name"
                  placeholder="Username"
                  autoComplete="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}

          <label className="sr-only" htmlFor="auth-email">
            Email Address
          </label>

          <div className="auth-input-row">
            <span className="auth-input-icon" aria-hidden="true">
              ✉
            </span>

            <input
              id="auth-email"
              type="email"
              name="email"
              placeholder="Email Address"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <label className="sr-only" htmlFor="auth-password">
            Password
          </label>

          <div className="auth-input-row">
            <span className="auth-input-icon" aria-hidden="true">
              🔒
            </span>

            <input
              id="auth-password"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              autoComplete={
                mode === "register"
                  ? "new-password"
                  : "current-password"
              }
              value={form.password}
              onChange={handleChange}
              required
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() =>
                setShowPassword((previous) => !previous)
              }
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
            >
              <EyeIcon visible={showPassword} />
            </button>
          </div>

          {mode === "register" && (
            <>
              <label className="sr-only" htmlFor="auth-confirm">
                Confirm Password
              </label>

              <div className="auth-input-row">
                <span className="auth-input-icon" aria-hidden="true">
                  🔐
                </span>

                <input
                  id="auth-confirm"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      (previous) => !previous
                    )
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                  aria-pressed={showConfirmPassword}
                >
                  <EyeIcon visible={showConfirmPassword} />
                </button>
              </div>

              <label className="auth-role-label" htmlFor="auth-role">
                Account Type
              </label>

              <select
                id="auth-role"
                className="auth-role-select"
                name="role"
                value={form.role}
                onChange={handleChange}
              >
                <option value="customer">Customer</option>
                <option value="seller">Seller</option>
              </select>
            </>
          )}

          {message && (
            <p
              className="auth-message"
              role="status"
              aria-live="polite"
            >
              {message}
            </p>
          )}

          <button className="auth-primary" type="submit">
            {mode === "register" ? "Sign Up" : "Login"}
          </button>
        </form>

        <footer className="auth-footer">
          <span>
            {mode === "register"
              ? "Already have an account?"
              : "Don't have an account?"}
          </span>{" "}

          <button
            type="button"
            className="auth-switch"
            onClick={() =>
              changeMode(mode === "register" ? "login" : "register")
            }
          >
            {mode === "register" ? "Login here" : "Sign up here"}
          </button>
        </footer>
      </section>
    </main>
  );
}
