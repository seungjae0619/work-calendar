import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // 쿠키를 자동으로 포함하기
});

// 요청 인터셉터: 세션 ID를 헤더에 자동으로 추가 (필요시)
apiClient.interceptors.request.use((config) => {
  const sessionId = sessionStorage.getItem("sessionId");
  if (sessionId) {
    config.headers["session-id"] = sessionId;
  }
  return config;
});

// 응답 인터셉터: 401 에러 시 로그인 페이지로 리다이렉트
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem("sessionId");
      window.location.href = "/";
    }
    return Promise.reject(error);
  },
);
