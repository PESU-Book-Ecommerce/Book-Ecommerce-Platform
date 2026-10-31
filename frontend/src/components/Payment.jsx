import { useState } from "react";
import { makePayment, getPaymentStatus } from "../services/payment";

export default function Payment({ orderId, token }) {
  const [method, setMethod] = useState("upi");
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handlePayment() {
    try {
      setLoading(true);
      setMessage("");
      setStatus("");

      const result = await makePayment(orderId, method, token);

      const paymentStatus = result.payment.paymentStatus;

      setStatus(paymentStatus);

      if (paymentStatus === "success") {
        setMessage("Payment successful!");
      } else if (paymentStatus === "failed") {
        setMessage("Payment failed. Please contact support.");
      } else {
        setMessage("Payment is pending.");
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function checkStatus() {
    try {
      setLoading(true);
      setMessage("");

      const result = await getPaymentStatus(orderId, token);

      setStatus(result.payment?.paymentStatus || result.orderPaymentStatus);
      setMessage(`Current payment status: ${result.orderPaymentStatus}`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: "20px", maxWidth: "400px" }}>
      <h2>Payment</h2>

      <p>Order ID: {orderId}</p>

      <label>Select Payment Method:</label>

      <select value={method} onChange={(e) => setMethod(e.target.value)}>
        <option value="upi">UPI</option>
        <option value="card">Card</option>
        <option value="cod">Cash on Delivery</option>
      </select>

      <br />
      <br />

      <button onClick={handlePayment} disabled={loading}>
        {loading ? "Processing..." : "Pay Now"}
      </button>

      <button onClick={checkStatus} disabled={loading}>
        Check Payment Status
      </button>

      {message && <p role="status">{message}</p>}

      {status && (
        <p>
          Payment Status: <strong>{status}</strong>
        </p>
      )}
    </div>
  );
}
