const LOCAL_API_URL = "http://localhost:8080/api";
const DEPLOYED_API_URL = "https://node-backend-4b48.onrender.com/api";

const isLocalhost =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname);

const API_URL =
  process.env.REACT_APP_API_URL || (isLocalhost ? LOCAL_API_URL : DEPLOYED_API_URL);

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const productAPI = {
  // GET ALL
  getAll: async () => {
    const res = await fetch(API_URL, {
      headers: {
        ...getAuthHeader(),
      },
    });
    return res.json();
  },

  // GET BY ID
  getById: async (id) => {
    const res = await fetch(`${API_URL}/${id}`, {
      headers: getAuthHeader(),
    });
    return res.json();
  },

  // CREATE PRODUCT (with image)
  create: async (formData) => {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        ...getAuthHeader(), // NO CONTENT-TYPE
      },
      body: formData,
    });

    return res.json();
  },

  // UPDATE PRODUCT
  update: async (id, formData) => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        // ❗ DO NOT add Content-Type here
        // Browser sets correct multipart/form-data boundary itself
      },
      body: formData,
    });

    return res.json();
  },

  // DELETE PRODUCT
  delete: async (id) => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: getAuthHeader(),
    });

    return res.json();
  },
};
