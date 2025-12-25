import axios from './axios';
import type { ApiResponse, Video } from '../types';

export const likeApi = {
  toggleVideoLike: async (videoId: string) => {
    const response = await axios.post<ApiResponse<{ isLiked: boolean }>>(
      `/likes/toggle/v/${videoId}`
    );
    return response.data;
  },

  toggleCommentLike: async (commentId: string) => {
    const response = await axios.post<ApiResponse<{ isLiked: boolean }>>(
      `/likes/toggle/c/${commentId}`
    );
    return response.data;
  },

  toggleTweetLike: async (tweetId: string) => {
    const response = await axios.post<ApiResponse<{ isLiked: boolean }>>(
      `/likes/toggle/t/${tweetId}`
    );
    return response.data;
  },

  getLikedVideos: async () => {
    const response = await axios.get<ApiResponse<Video[]>>('/likes/videos');
    return response.data;
  },
};
