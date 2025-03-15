import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

interface NextApiClientInstance extends AxiosInstance {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T = any, R = any>(
    url: string,
    body?: T,
    config?: AxiosRequestConfig
  ): Promise<R>;
}

// TODO: merge to one
const API: NextApiClientInstance = axios.create({
  baseURL: "http://localhost:3000/api/v1",
});

export const POST_API: NextApiClientInstance = axios.create({
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

// TODO: add flexibility to handle errors
POST_API.interceptors.response.use(
  (response: any) => {
    return response.data;
  },
  (error: any) => {
    const errors: Record<string, Record<string, string>> = {};
    error.response.data.errors.forEach((error: Record<string, string>) => {
      return (errors[error.field] = { message: error.messages });
    });
    return { errors };
  }
);

export default API;
