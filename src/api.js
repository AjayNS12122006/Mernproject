const BASE_URL = "http://localhost:5000/api";

async function request(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

// Auth
export const registerUser = (payload) =>
  request("/auth/register", { method: "POST", body: payload });

export const loginUser = (payload) =>
  request("/auth/login", { method: "POST", body: payload });

export const getProfile = (token) => request("/auth/profile", { token });

export const updateProfile = (payload, token) =>
  request("/auth/profile", { method: "PUT", body: payload, token });

// Contacts
export const getContacts = (token) => request("/contacts", { token });

export const addContact = (payload, token) =>
  request("/contacts", { method: "POST", body: payload, token });

export const deleteContact = (id, token) =>
  request(`/contacts/${id}`, { method: "DELETE", token });

// Walks — history
export const getWalks = (token) => request("/walks", { token });

export const deleteWalk = (id, token) =>
  request(`/walks/${id}`, { method: "DELETE", token });

// Walks — live tracking lifecycle
export const startWalk = (payload, token) =>
  request("/walks/start", { method: "POST", body: payload, token });

export const updateWalkLocation = (id, payload, token) =>
  request(`/walks/${id}/location`, { method: "PUT", body: payload, token });

export const finishWalk = (id, payload, token) =>
  request(`/walks/${id}/finish`, { method: "PUT", body: payload, token });

export const sendWalkSOS = (id, payload, token) =>
  request(`/walks/${id}/sos`, { method: "POST", body: payload, token });

// Public — no token, used by the shared /track/:shareToken page
export const getPublicTrack = (shareToken) =>
  request(`/walks/track/${shareToken}`);
