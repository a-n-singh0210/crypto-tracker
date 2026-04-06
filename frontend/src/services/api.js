// Use REACT_APP_API_URL if set (like on Render), otherwise default to localhost
const API = process.env.REACT_APP_API_URL || "http://localhost:8080";

const handleResponse = async (res) => {
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
};

export const getPortfolio = (username) => 
  fetch(`${API}/portfolio/${username}`).then(handleResponse).catch(err => {
    console.error("Portfolio fetch failed:", err);
    return [];
  });

export const getAnalytics = (username) => 
  fetch(`${API}/analytics/${username}`).then(handleResponse).catch(err => {
    console.error("Analytics fetch failed:", err);
    return null;
  });

export const getPredictions = (username) => 
  fetch(`${API}/predict/${username}`).then(handleResponse).catch(err => {
    console.error("Predictions fetch failed:", err);
    return [];
  });

export const addCrypto = (data) => 
  fetch(`${API}/portfolio/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).then(handleResponse);

export const deleteCrypto = (id) => 
  fetch(`${API}/portfolio/delete/${id}`, {
    method: "DELETE"
  }).then(handleResponse);

export const login = (data) => 
  fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).then(handleResponse);

export const register = (data) => 
  fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).then(handleResponse);

export const getMarketGlobal = () => 
  fetch(`${API}/market/global`).then(handleResponse).catch(err => {
    console.error("Market data fetch failed:", err);
    return [];
  });
