const API_URL =
  import.meta.env.VITE_API_URL || "https://node-backend-4b48.onrender.com/api";

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
    const res = await fetch(API_URL, "/", {
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
