import { request } from "./http";

export const getCart = (token) => request("/api/cart", { token });

export const addToCart = (bookId, quantity, token) =>
  request("/api/cart/add", { method: "POST", token, body: { bookId, quantity } });

export const updateQuantity = (bookId, quantity, token) =>
  request(`/api/cart/update/${bookId}`, { method: "PUT", token, body: { quantity } });

export const removeFromCart = (bookId, token) =>
  request(`/api/cart/remove/${bookId}`, { method: "DELETE", token });

export const validateCart = (token) =>
  request("/api/cart/validate", { method: "POST", token });
