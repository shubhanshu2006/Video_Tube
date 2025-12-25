import axios from './axios';
import type { ApiResponse } from '../types';

export interface Notification {
  _id: string;
  recipient: string;
  sender: {
    _id: string;
    fullName: string;
    username: string;
    avatar: string;
  };
  type: 'like' | 'subscribe' | 'comment';
  video?: {
    _id: string;
    title: string;
    thumbnail: string;
  };
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationApi = {
  getNotifications: async (params?: { page?: number; limit?: number }) => {
    const response = await axios.get<
      ApiResponse<{ notifications: Notification[]; unreadCount: number }>
    >('/notifications', { params });
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await axios.get<ApiResponse<{ unreadCount: number }>>(
      '/notifications/unread-count'
    );
    return response.data;
  },

  markAsRead: async (notificationId: string) => {
    const response = await axios.patch<ApiResponse<Notification>>(
      `/notifications/${notificationId}/read`
    );
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await axios.patch<ApiResponse<Record<string, never>>>(
      '/notifications/mark-all-read'
    );
    return response.data;
  },

  deleteNotification: async (notificationId: string) => {
    const response = await axios.delete<ApiResponse<Record<string, never>>>(
      `/notifications/${notificationId}`
    );
    return response.data;
  },
};

export const likeApi = {
  getVideoLikes: async (videoId: string) => {
    const response = await axios.get<
      ApiResponse<
        Array<{
          _id: string;
          user: {
            _id: string;
            fullName: string;
            username: string;
            avatar: string;
          };
          createdAt: string;
        }>
      >
    >(`/likes/video/${videoId}`);
    return response.data;
  },
};
