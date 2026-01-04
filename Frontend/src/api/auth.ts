import axios from "./axios";
import type { ApiResponse, User, Video } from "../types";

export const authApi = {
  register: async (data: FormData) => {
    const response = await axios.post<ApiResponse<User>>(
      "/users/register",
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await axios.post<
      ApiResponse<{ user: User; accessToken: string; refreshToken: string }>
    >("/users/login", {
      email,
      password,
    });

    return response.data;
  },

  logout: async () => {
    const response = await axios.post<ApiResponse<null>>("/users/logout");
    return response.data;
  },

  verifyEmail: async (token: string) => {
    const response = await axios.get<ApiResponse<null>>(
      `/users/verify-email/${token}`
    );
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await axios.get<ApiResponse<User>>("/users/current-user");
    return response.data;
  },

  changePassword: async (oldPassword: string, newPassword: string) => {
    const response = await axios.post<ApiResponse<null>>(
      "/users/change-password",
      {
        oldPassword,
        newPassword,
      }
    );
    return response.data;
  },

  updateAccount: async (fullName: string, email: string) => {
    const response = await axios.patch<ApiResponse<User>>(
      "/users/update-account",
      {
        fullName,
        email,
      }
    );
    return response.data;
  },

  updateAvatar: async (avatar: File) => {
    const formData = new FormData();
    formData.append("avatar", avatar);

    const response = await axios.patch<ApiResponse<User>>(
      "/users/avatar",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  updateCoverImage: async (coverImage: File) => {
    const formData = new FormData();
    formData.append("coverImage", coverImage);

    const response = await axios.patch<ApiResponse<User>>(
      "/users/cover-image",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  getChannelProfile: async (username: string) => {
    const response = await axios.get<
      ApiResponse<User & { subscribersCount: number; isSubscribed: boolean }>
    >(`/users/c/${username}`);
    return response.data;
  },

  getWatchHistory: async () => {
    const response = await axios.get<ApiResponse<Video[]>>("/users/history");
    return response.data;
  },

  removeFromWatchHistory: async (videoId: string) => {
    const response = await axios.delete<ApiResponse<Record<string, never>>>(`/users/history/${videoId}`);
    return response.data;
  },

  deleteAccount: async () => {
    const response = await axios.delete<ApiResponse<Record<string, never>>>('/users/delete-account');
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await axios.post<ApiResponse<null>>("/users/forgot-password", {
      email,
    });
    return response.data;
  },

  resetPassword: async (token: string, password: string) => {
    const response = await axios.post<ApiResponse<null>>(`/users/reset-password/${token}`, {
      password,
    });
    return response.data;
  },
};
