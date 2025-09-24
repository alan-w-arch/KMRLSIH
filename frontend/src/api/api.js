// src/api/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://localhost:8080", // change to your FastAPI base URL
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
