const CONFIG = {
  BACKEND_IP: "192.168.1.2",
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
    CHAT: "/api/chat",
    UPDATE_CAR: "/cars/update",
    UPDATE_AVATAR: "/api/auth/update-avatar",
    USER_KYC: "/api/user/submit-kyc",
    UPLOAD: "/upload",

    KYC_VERIFY: "/api/kyc/verify",
    KYC_UPLOAD_ID: "/api/kyc/upload-id",
    KYC_UPLOAD_SELFIE: "/api/kyc/upload-selfie",

    // ✅ ADD THESE
    CREATE_ORDER: "/api/payment/create-order",
    VERIFY_PAYMENT: "/api/payment/verify",
  },
};

export default CONFIG;