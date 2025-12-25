import axios from './axios';
import type { ApiResponse, Video } from '../types';

interface GetAllVideosResponse {
  videos: Video[];
  totalVideos: number;
  currentPage: number;
  totalPages: number;
}

export const videoApi = {
  getAllVideos: async (params?: {
    page?: number;
    limit?: number;
    query?: string;
    sortBy?: string;
    sortType?: string;
    userId?: string;
  }) => {
    const response = await axios.get<ApiResponse<GetAllVideosResponse>>('/videos', { params });
    return response.data;
  },

  getVideoById: async (videoId: string) => {
    const response = await axios.get<ApiResponse<Video>>(`/videos/${videoId}`);
    return response.data;
  },

  publishVideo: async (data: FormData) => {
    const response = await axios.post<ApiResponse<Video>>('/videos', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateVideo: async (videoId: string, data: FormData) => {
    const response = await axios.patch<ApiResponse<Video>>(`/videos/${videoId}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteVideo: async (videoId: string) => {
    const response = await axios.delete<ApiResponse<Record<string, never>>>(`/videos/${videoId}`);
    return response.data;
  },

  togglePublishStatus: async (videoId: string) => {
    const response = await axios.patch<ApiResponse<Video>>(`/videos/toggle/publish/${videoId}`);
    return response.data;
  },

  recordView: async (videoId: string) => {
    const response = await axios.post<ApiResponse<Record<string, never>>>(`/videos/${videoId}/view`);
    return response.data;
  },
};
