import axios from './axios';
import type { ApiResponse } from '../types';

interface Subscriber {
  _id: string;
  subscriber: {
    _id: string;
    fullName: string;
    username: string;
    avatar: string;
  };
  createdAt: string;
}

interface SubscribedChannel {
  _id: string;
  channel: {
    _id: string;
    fullName: string;
    username: string;
    avatar: string;
  };
  createdAt: string;
}

export const subscriptionApi = {
  toggleSubscription: async (channelId: string) => {
    const response = await axios.post<ApiResponse<{ subscribed: boolean }>>(
      `/subscriptions/c/${channelId}`
    );
    return response.data;
  },

  getUserChannelSubscribers: async (channelId: string) => {
    const response = await axios.get<ApiResponse<Subscriber[]>>(
      `/subscriptions/c/${channelId}`
    );
    return response.data;
  },

  getSubscribedChannels: async (subscriberId: string) => {
    const response = await axios.get<ApiResponse<SubscribedChannel[]>>(
      `/subscriptions/u/${subscriberId}`
    );
    return response.data;
  },
};
