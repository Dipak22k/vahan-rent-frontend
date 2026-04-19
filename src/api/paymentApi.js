import axios from "axios";
import CONFIG from "../config"; // adjust path if needed

export const createOrder = async (amount) => {
  const res = await axios.post(
    `${CONFIG.BASE_URL}${CONFIG.ENDPOINTS.CREATE_ORDER}`,
    { amount }
  );
  return res.data;
};

export const verifyPayment = async (data) => {
  const res = await axios.post(
    `${CONFIG.BASE_URL}${CONFIG.ENDPOINTS.VERIFY_PAYMENT}`,
    data
  );
  return res.data;
};