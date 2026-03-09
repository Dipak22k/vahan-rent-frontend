import CONFIG from "./config";

/* ---------------- SAFE FETCH WRAPPER ---------------- */
const safeFetch = async (url, options = {}, timeout = 8000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    let data;

    try {
      data = await response.json();
    } catch {
      throw new Error("Invalid server response");
    }

    if (!response.ok) {
      throw new Error(data?.message || "Request failed");
    }

    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Request timeout. Check your connection.");
    }

    if (error.message === "Network request failed") {
      throw new Error("Cannot connect to server.");
    }

    throw error;
  } finally {
    clearTimeout(id);
  }
};

/* ---------------- HELPERS ---------------- */
const normalizeEmail = (email) => email?.toLowerCase().trim();

/* ================= LOGIN ================= */
export const loginUser = async (email, password) => {
  return safeFetch(`${CONFIG.BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: normalizeEmail(email),
      password,
    }),
  });
};

/* ================= REGISTER ================= */
export const registerUser = async (userData) => {
  return safeFetch(`${CONFIG.BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...userData,
      email: normalizeEmail(userData.email),
    }),
  });
};

/* ================= SEND OTP ================= */
export const sendOtp = async (email) => {
  return safeFetch(`${CONFIG.BASE_URL}/api/auth/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: normalizeEmail(email),
    }),
  });
};
/* ================= SEND RESET OTP ================= */
export const sendResetOtp = async (email) => {
  return safeFetch(`${CONFIG.BASE_URL}/api/auth/verify-reset-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: normalizeEmail(email),
    }),
  });
};

/* ================= VERIFY OTP ================= */
export const verifyOtp = async (email, otp) => {
  return safeFetch(`${CONFIG.BASE_URL}/api/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: normalizeEmail(email),
      otp,
    }),
  });
};

/* ================= VERIFY RESET OTP ================= */
export const verifyResetOtp = async (email, otp) => {
  return safeFetch(`${CONFIG.BASE_URL}/api/auth/verify-reset-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: normalizeEmail(email),
      otp,
    }),
  });
};

/* ================= RESET PASSWORD ================= */
export const resetPassword = async (email, newPassword) => {
  return safeFetch(`${CONFIG.BASE_URL}/api/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: normalizeEmail(email),
      newPassword,
    }),
  });
};