import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "./scss/style.scss";

import { BrowserRouter } from "react-router-dom";
//
import "react-loading-skeleton/dist/skeleton.css";
//

//bootstrap
import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { AuthProvider } from "./context/AuthProvider";

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </AuthProvider>
);
