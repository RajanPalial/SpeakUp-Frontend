import React from "react";

import Routes from "./router/Router.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
      <ToastContainer position="top-right" theme="light" />

      <Routes />
    </>
  );
}

export default App;
