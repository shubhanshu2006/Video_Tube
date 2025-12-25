import axios from './axios';
import type { ApiResponse, Video, ChannelStats } from '../types';

interface DashboardVideosResponse {
  videos: Video[];
  pagination: {
    currentPage: number;
    limit: number;
    totalVideos: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const dashboardApi = {
  getChannelStats: async () => {
    const response = await axios.get<ApiResponse<ChannelStats>>('/dashboard/stats');
    return response.data;
  },

  getChannelVideos: async (params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortType?: string;
  }) => {
    const response = await axios.get<ApiResponse<DashboardVideosResponse>>('/dashboard/videos', {
      params,
    });
    return response.data;
  },
};
