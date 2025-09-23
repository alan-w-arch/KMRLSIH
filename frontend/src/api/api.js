// src/api/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://878f496b1a66.ngrok-free.app", // change to your FastAPI base URL
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
