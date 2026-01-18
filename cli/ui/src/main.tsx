import { createRoot } from "react-dom/client";
import { App } from "./app";
import "./styles.css";

export const mountApp = (element: HTMLElement) => {
  const root = createRoot(element);
  root.render(<App />);
};

const rootElement = document.getElementById("root");

if (rootElement) {
  mountApp(rootElement);
}
