import { createBrowserRouter } from "react-router";
import { HomePage } from "../pages/home/HomePage.js";
import { NotFoundPage } from "../pages/not-found/NotFoundPage.js";

export const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  { path: "*", element: <NotFoundPage /> },
]);
