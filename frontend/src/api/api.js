// src/api/api.js
import axios from "axios";

const api = axios.create({
<<<<<<< HEAD
  baseURL: "https://30f7119dbf4d.ngrok-free.app", // change to your FastAPI base URL
=======
  baseURL: "http://localhost:8080", // change to your FastAPI base URL
>>>>>>> frontend-hs-06
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
