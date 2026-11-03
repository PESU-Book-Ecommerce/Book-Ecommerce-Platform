import { request } from "./http";

export const getReviews = (bookId) => request(`/api/books/${bookId}/reviews`);

export const submitReview = (bookId, rating, comment, token) =>
  request(`/api/books/${bookId}/reviews`, {
    method: "POST",
    token,
    body: { rating, comment },
  });
