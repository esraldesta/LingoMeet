import axios from "axios";
let logoutFunction = null;

// Function to set the logout function from AuthContext
export const setLogoutFunction = (logout) => {
  logoutFunction = logout;
};

const API = axios.create({
  // TODO: replace URL value from env
  baseURL: "http://localhost:3000/api/v1",
});

// Request interceptor
API.interceptors.request.use(
  (config) => {
    // Add any custom configurations here
    // For example, adding an Authorization header
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
API.interceptors.response.use(
  (response) => {
    // Handle the response data here
    if (response.data && response.data.data.errors) {
      return Promise.reject({
        response: {
          status: 403,
          data: response.data,
        },
      });
    }
    return response;
  },
  (error) => {
    // Handle errors here
    if (error.response && error.response.status >= 401) {
      if (logoutFunction) {
        logoutFunction(); // Trigger the logout function when token is expired
      }

      // Optionally, redirect the user to the sign-in page
      window.location.href = "/signin";
    }
    return Promise.reject(error);
  }
);

export default API;
