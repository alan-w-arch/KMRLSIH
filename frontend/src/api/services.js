import api from "./api";

// Auth
export const login = async (user_id, password) => {
  const response = await api.post("/auth/login", { user_id, password });
  return response.data;
};

export const getProfile = async (user_id) => {
  const response = await api.get(`/profile/${user_id}`);
  return response.data;
};

// Uploads
export const uploadUrl = async (user_id, url, dept_name) => {
  const response = await api.post("/url", { user_id, url, dept_name });
  return response.data;
};

export const uploadFile = async (file, user_id, dept_name) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("user_id", user_id);
  formData.append("dept_name", dept_name);

  const response = await api.post("/file", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};

// Views & Summaries
export const markViewed = async (user_id, doc_id) => {
  const response = await api.post("/viewed", { user_id, doc_id });
  return response.data;
};

export const getSummary = async (doc_id) => {
  const response = await api.get("/summary", {
    params: { doc_id },
  });
  return response.data;
};

// Root
export const getRoot = async () => {
  const response = await api.get("/");
  return response.data;
};
