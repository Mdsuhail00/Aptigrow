import axios from "axios";

const api = axios.create({
  baseURL: "http://aptigrow-backend.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;