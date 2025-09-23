// src/api/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://30f7119dbf4d.ngrok-free.app", // change to your FastAPI base URL
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
