const API_BASE = "http://localhost:5000";

const authFetch = (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token");

  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      ...(options.headers || {}),
    },
  });
};

// ---------- AUTH ----------
export const login = async (email: string, role: string) => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, role }),
  });

  if (!res.ok) throw new Error("Login failed");

  const data = await res.json();
  localStorage.setItem("token", data.token);
  return data;
};

// ---------- PRODUCTS ----------
export const getProducts = async () => {
  const res = await fetch(`${API_BASE}/products`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
};

// ---------- ORDERS ----------
export const createOrder = async (orderData: any) => {
  const res = await authFetch(`${API_BASE}/orders`, {
    method: "POST",
    body: JSON.stringify(orderData),
  });

  if (!res.ok) throw new Error("Order failed");
  return res.json();
};

export const getOrders = async () => {
  const res = await authFetch(`${API_BASE}/orders`);
  if (!res.ok) throw new Error("Fetch orders failed");
  return res.json();
};

export const verifyAndCompleteOrder = async (orderId: string, otp: string) => {
  const res = await authFetch(`${API_BASE}/orders/verify`, {
    method: "POST",
    body: JSON.stringify({ orderId, otp }),
  });

  if (!res.ok) throw new Error("OTP verification failed");
  return res.json();
};
// ---------- VENDOR ----------
export const saveProduct = async (product: any) => {
  const res = await authFetch(`${API_BASE}/products`, {
    method: "POST",
    body: JSON.stringify(product),
  });

  if (!res.ok) throw new Error("Save product failed");
  return res.json();
};

export const deleteProduct = async (id: string) => {
  const res = await authFetch(`${API_BASE}/products/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Delete product failed");
  return res.json();
};

// ---------- RIDER ----------
export const updateOrderStatus = async (
  orderId: string,
  status: string,
  riderId?: string
) => {
  const res = await authFetch(`${API_BASE}/orders/status`, {
    method: "POST",
    body: JSON.stringify({ orderId, status, riderId }),
  });

  if (!res.ok) throw new Error("Update order failed");
  return res.json();
};
