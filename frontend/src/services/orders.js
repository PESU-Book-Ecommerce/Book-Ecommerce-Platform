
import { request } from "./http";

export const createOrder = (shippingAddress, token) =>
  request("/api/orders", {
    method: "POST",
    token,
    body: { shippingAddress },
  });

export const getMyOrders = (token) =>
  request("/api/orders/my-orders", { token });

export const getSellerOrders = (token) =>
  request("/api/orders/seller-orders", { token });

export const updateOrderStatus = (orderId, status, token) =>
  request(`/api/orders/${orderId}/status`, {
    method: "PUT",
    token,
    body: { status },
  });

