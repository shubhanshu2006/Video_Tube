import axios from './axios';
import type { ApiResponse, Comment } from '../types';

interface CommentPaginationResponse {
  docs: Comment[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
  pagingCounter: number;
}

export const commentApi = {
  getVideoComments: async (videoId: string, params?: { page?: number; limit?: number }) => {
    const response = await axios.get<ApiResponse<CommentPaginationResponse>>(
      `/comments/${videoId}`,
      { params }
    );
    return response.data;
  },

  addComment: async (videoId: string, content: string) => {
    const response = await axios.post<ApiResponse<Comment>>(`/comments/${videoId}`, { content });
    return response.data;
  },

  updateComment: async (commentId: string, content: string) => {
    const response = await axios.patch<ApiResponse<Comment>>(`/comments/c/${commentId}`, {
      content,
    });
    return response.data;
  },

  deleteComment: async (commentId: string) => {
    const response = await axios.delete<ApiResponse<Record<string, never>>>(`/comments/c/${commentId}`);
    return response.data;
  },

  getTweetComments: async (tweetId: string, params?: { page?: number; limit?: number }) => {
    const response = await axios.get<ApiResponse<CommentPaginationResponse>>(
      `/comments/t/${tweetId}`,
      { params }
    );
    return response.data;
  },

  addTweetComment: async (tweetId: string, content: string) => {
    const response = await axios.post<ApiResponse<Comment>>(`/comments/t/${tweetId}`, { content });
    return response.data;
  },
};
