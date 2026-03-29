import axios from "axios";

const BASE_API_URL = import.meta.env.PROD ? "/api" : "http://localhost:5000/api";

/**
 * Standardized Axios client for all API interactions.
 * Configured with base URL and supports cross-origin credentials.
 */
const apiClient = axios.create({
  baseURL: BASE_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Handle responses and global errors such as 401 Unauthorized.
 */
apiClient.interceptors.response.use(
  (response) => {
    // Standardizing response data structure if necessary
    return response.data;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Session expired or unauthorized. Authentication required.");
      // Optional: Logic to trigger logout or redirect
    }
    
    // Customize error message for easier UI consumption
    const customError = {
      message: error.response?.data?.message || "An unexpected network error occurred.",
      status: error.response?.status,
      success: false,
    };

    return Promise.reject(customError);
  }
);

export default apiClient;
