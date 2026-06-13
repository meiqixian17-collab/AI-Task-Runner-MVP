import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import FlowDemoV2 from "./FlowDemoV2.jsx";
import PortfolioPreview from "./PortfolioPreview.jsx";
import "./App.css";

const pathname = window.location.pathname.replace(/\/+$/, "");
const routes = {
  "/flow-demo-v2": FlowDemoV2,
  "/portfolio-preview": PortfolioPreview
};
const Root = routes[pathname] || App;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
