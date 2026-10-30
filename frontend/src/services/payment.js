import API_BASE from "./api";

// Create a simulated payment
export async function makePayment(orderId, paymentMethod, token) {
  try {
    const response = await fetch(`${API_BASE}/api/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        orderId,
        paymentMethod,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Payment failed");
    }

    return data;
  } catch (error) {
    throw new Error(error.message || "Unable to process payment");
  }
}

// Retrieve payment status
export async function getPaymentStatus(orderId, token) {
  try {
    const response = await fetch(`${API_BASE}/api/payments/${orderId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to retrieve payment status");
    }

    return data;
  } catch (error) {
    throw new Error(error.message || "Unable to retrieve payment status");
  }
}
