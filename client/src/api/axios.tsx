import axios from "axios";

const API = axios.create({
  // baseURL: "https://lingomeetbackend.onrender.com/api/v1",
  baseURL: "http://localhost:3000/api/v1",
});

// Response interceptor
API.interceptors.response.use(
  (response: any) => {
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
  (error: any) => {
    // Handle errors here
    if (error.response && error.response.status >= 401) {
      // Optionally, redirect the user to the sign-in page
      window.location.href = "/notfound";
    }
    return Promise.reject(error);
  }
);

export default API;
