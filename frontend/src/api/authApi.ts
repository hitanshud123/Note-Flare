import axiosInstance from './axiosInstance';

interface AuthResponse {
  user: {
    id: number;
    username: string;
  };
  token?: string;
}

interface SessionResponse {
  user: {
    id: number;
    username: string;
  };
}

export const login = async (
  username: string,
  password: string,
): Promise<AuthResponse> => {
  const response = await axiosInstance.post<AuthResponse>(
    "/api/auth/login",
    { username, password },
  );
  return response.data;
};

export const signup = async (
  username: string,
  password: string,
): Promise<AuthResponse> => {
  const response = await axiosInstance.post<AuthResponse>(
    "/api/auth/signup",
    { username, password },
  );
  return response.data;
};

export const logout = async (): Promise<void> => {
  await axiosInstance.post("/api/auth/logout");
};

export const checkSession = async (): Promise<SessionResponse> => {
  const response = await axiosInstance.get<SessionResponse>("/api/auth/session");
  return response.data;
};
