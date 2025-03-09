// const API = axios.create({
//   // baseURL: "https://lingomeetbackend.onrender.com/api/v1",
//   baseURL: "http://localhost:3000/api/v1",
// });

// // Response interceptor
// API.interceptors.response.use(
//   (response: any) => {
//     // Handle the response data here
//     if (response.data && response.data.data.errors) {
//       return Promise.reject({
//         response: {
//           status: 403,
//           data: response.data,
//         },
//       });
//     }
//     return response;
//   },
//   (error: any) => {
//     // Handle errors here
//     if (error.response && error.response.status >= 401) {
//       // Optionally, redirect the user to the sign-in page
//       window.location.href = "/notfound";
//     }
//     return Promise.reject(error);
//   }
// );

// export default API;

import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

interface NextApiClientInstance extends AxiosInstance {
  get<T = any, R = T>(url: string, config?: AxiosRequestConfig): Promise<R>;
}

const API: NextApiClientInstance = axios.create({
  // baseURL: "https://lingomeetbackend.onrender.com/api/v1",
  baseURL: "http://localhost:3000/api/v1",
});

API.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    let message: string;

    // Check if the error has a response
    if (error.response) {
      // Handle server errors
      message =
        error.response.data?.message ||
        error.message ||
        error.response.data.error?.message ||
        "An unknown server error occurred";
    } else if (error.request) {
      // Handle request made but no response received
      message = "No response received from the server";
    } else {
      // Handle other types of errors (e.g., setup errors)
      message = error.message || "An unexpected error occurred.";
    }

    // Handle network errors specifically
    if (error.message === "Network Error") {
      message = "Please check your internet connection.";
    }

    return Promise.reject({ message });
  }
);

export default API;
