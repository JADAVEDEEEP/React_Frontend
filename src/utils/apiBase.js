const LOCAL_BACKEND_URL = "http://localhost:8080";
const DEPLOYED_BACKEND_URL = "https://node-backend-4b48.onrender.com";

const isLocalhost =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname);

export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (isLocalhost ? LOCAL_BACKEND_URL : DEPLOYED_BACKEND_URL);

export const API_URL = `${API_BASE_URL}/api`;
export const AUTH_URL = `${API_BASE_URL}/auth`;
