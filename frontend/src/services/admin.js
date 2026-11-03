import { request } from "./http";

export const getUsers = (token) => request("/api/admin/users", { token });
export const getBooks = (token) => request("/api/admin/books", { token });
export const deleteBook = (bookId, token) =>
  request(`/api/admin/books/${bookId}`, { method: "DELETE", token });
export const getPendingReviews = (token) =>
  request("/api/admin/reviews/pending", { token });
export const approveReview = (reviewId, token) =>
  request(`/api/admin/reviews/${reviewId}/approve`, { method: "PATCH", token });
