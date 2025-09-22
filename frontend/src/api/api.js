// src/api/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://c73e6fbcc284.ngrok-free.app", // change to your FastAPI base URL
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
