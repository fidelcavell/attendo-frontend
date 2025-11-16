import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Add a request interceptor to include JWT and CSRF tokens in every endpoint requests
api.interceptors.request.use(
  async (config) => {
    const jwtToken = localStorage.getItem("JWT_TOKEN");
    if (jwtToken && config.headers) {
      config.headers.Authorization = `Bearer ${jwtToken}`;
    }

    // let csrfToken;
    // try {
    //   const response = await axios.get<{ token: string }>(
    //     `${import.meta.env.VITE_BASE_URL}/api/csrf-token`,
    //     { withCredentials: true }
    //   );
    //   csrfToken = response.data.token;
    //   localStorage.setItem("CSRF_TOKEN", csrfToken);
    // } catch (error) {
    //   console.error("Failed to fetch CSRF token", error);
    // }

    // if (csrfToken && config.headers) {
    //   config.headers["X-XSRF-TOKEN"] = csrfToken;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
