import axios from './axios';
import type { ApiResponse, Tweet } from '../types';

export const tweetApi = {
  createTweet: async (content: string) => {
    const response = await axios.post<ApiResponse<Tweet>>('/tweets', { content });
    return response.data;
  },

  getUserTweets: async (userId: string) => {
    const response = await axios.get<ApiResponse<Tweet[]>>(`/tweets/user/${userId}`);
    return response.data;
  },

  updateTweet: async (tweetId: string, content: string) => {
    const response = await axios.patch<ApiResponse<Tweet>>(`/tweets/${tweetId}`, { content });
    return response.data;
  },

  deleteTweet: async (tweetId: string) => {
    const response = await axios.delete<ApiResponse<Record<string, never>>>(`/tweets/${tweetId}`);
    return response.data;
  },
};
