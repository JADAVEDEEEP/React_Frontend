const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const productAPI = {
  getAll: async () => {
    const token = localStorage.getItem('token'); // ✅ add this
    const res = await fetch(API_URL, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // ✅ include Bearer token
      },
    });
    return res.json();
  },
  // ✅ Get product by ID
  getById: async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
      headers: getAuthHeader(),
    });
    return response.json();
  },

  // ✅ Create new product
  create: async (data) => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // ✅ Update existing product
  update: async (id, data) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // ✅ Delete product
  delete: async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: getAuthHeader(),
    });
    return response.json();
  },
};
