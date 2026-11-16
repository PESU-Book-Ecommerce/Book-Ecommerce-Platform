
import { request } from "./http";

// Fetch all books
export const getBooks = () => request("/api/books");

// Add a book
export const createBook = (bookData, token) =>
  request("/api/books", {
    method: "POST",
    token,
    body: bookData,
  });

// Update a seller's own book
export const updateBook = (bookId, bookData, token) =>
  request(`/api/books/${bookId}`, {
    method: "PATCH",
    token,
    body: bookData,
  });

// Delete a seller's own book
export const deleteBook = (bookId, token) =>
  request(`/api/books/${bookId}`, {
    method: "DELETE",
    token,
  });
