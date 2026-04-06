const CONFIG = {
  BACKEND_IP: "192.168.1.10",
  PORT: "5000",

  get BASE_URL() {
    return `http://${this.BACKEND_IP}:${this.PORT}`;
  },

  ENDPOINTS: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    GOOGLE_AUTH: "/api/auth/google",

    USERS: "/users",
    CARS: "/cars",
    CHAT: "/api/chat",   // ✅ fixed earlier
    UPDATE_CAR: "/cars/update",
    UPDATE_AVATAR: "/api/auth/update-avatar",
    USER_KYC: "/api/user/submit-kyc",
    UPLOAD: "/upload",

     KYC_VERIFY: "/api/kyc/verify",      // ✅ ADD THIS
    KYC_UPLOAD_ID: "/api/kyc/upload-id",
    KYC_UPLOAD_SELFIE: "/api/kyc/upload-selfie",
  },
};

export default CONFIG;