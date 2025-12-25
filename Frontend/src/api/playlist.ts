import axios from './axios';
import type { ApiResponse, Playlist } from '../types';

export const playlistApi = {
  createPlaylist: async (name: string, description: string) => {
    const response = await axios.post<ApiResponse<Playlist>>('/playlist', { name, description });
    return response.data;
  },

  getPlaylistById: async (playlistId: string) => {
    const response = await axios.get<ApiResponse<Playlist>>(`/playlist/${playlistId}`);
    return response.data;
  },

  updatePlaylist: async (playlistId: string, name?: string, description?: string) => {
    const response = await axios.patch<ApiResponse<Playlist>>(`/playlist/${playlistId}`, {
      name,
      description,
    });
    return response.data;
  },

  deletePlaylist: async (playlistId: string) => {
    const response = await axios.delete<ApiResponse<Record<string, never>>>(`/playlist/${playlistId}`);
    return response.data;
  },

  addVideoToPlaylist: async (playlistId: string, videoId: string) => {
    const response = await axios.patch<ApiResponse<Playlist>>(
      `/playlist/add/${videoId}/${playlistId}`
    );
    return response.data;
  },

  removeVideoFromPlaylist: async (playlistId: string, videoId: string) => {
    const response = await axios.patch<ApiResponse<Playlist>>(
      `/playlist/remove/${videoId}/${playlistId}`
    );
    return response.data;
  },

  getUserPlaylists: async (userId: string) => {
    const response = await axios.get<ApiResponse<Playlist[]>>(`/playlist/user/${userId}`);
    return response.data;
  },
};
