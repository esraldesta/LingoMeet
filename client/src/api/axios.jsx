import axios from "axios";


const API = axios.create({
  // TODO: replace URL value from env
  baseURL: "https://lingomeetbackend.onrender.com/api/v1",
});


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
      // Optionally, redirect the user to the sign-in page
      window.location.href = "/notfound";
    }
    return Promise.reject(error);
  }
);

export default API;
