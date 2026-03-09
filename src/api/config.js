const CONFIG = {
  BACKEND_IP: "10.98.204.241",   // 🔥 CHANGE ONLY THIS
  PORT: "5000",

  get BASE_URL() {
    return `http://${this.BACKEND_IP}:${this.PORT}`;
  },

  ENDPOINTS: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",

    USERS: "/users",
    CARS: "/cars",
    CHAT: "/chat",
    UPDATE_CAR: "/cars/update",
    UPDATE_AVATAR: "/users/update-avatar",

    UPLOAD: "/upload",   // ⭐ ADD THIS (IMPORTANT)
  },
};

export default CONFIG;