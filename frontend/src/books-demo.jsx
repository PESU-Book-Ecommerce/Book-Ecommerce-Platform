import React from "react";
import ReactDOM from "react-dom/client";

import BookSearch from "./components/BookSearch";
import SellerBooks from "./components/SellerBooks";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <>
      <SellerBooks />
      <BookSearch />
    </>
  </React.StrictMode>,
);
