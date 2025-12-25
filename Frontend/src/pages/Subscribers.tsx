import { useQuery } from '@tanstack/react-query';
import { subscriptionApi } from '../api/subscription';
import { useAuth } from '../hooks/useAuth';
import { Users } from 'lucide-react';
import { Link } from 'react-router-dom';

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

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const Subscribers = () => {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['subscribers', user?._id],
    queryFn: () => subscriptionApi.getUserChannelSubscribers(user!._id),
    enabled: !!user?._id,
  });

  const subscribers: Subscriber[] = data?.data || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">My Subscribers</h1>

        {subscribers.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-xl">No subscribers yet</p>
            <p className="text-sm mt-2">
              Share your channel to get more subscribers
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {subscribers.map((sub: Subscriber) => (
              <Link
                key={sub._id}
                to={`/channel/${sub.subscriber.username}`}
                className="flex items-center gap-4 p-4 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 hover:border-gray-600/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <img
                  src={sub.subscriber.avatar}
                  alt={sub.subscriber.fullName}
                  className="w-16 h-16 rounded-full ring-2 ring-red-500/20"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">
                    {sub.subscriber.fullName}
                  </h3>
                  <p className="text-gray-400 text-sm">@{sub.subscriber.username}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    Subscribed on {formatDate(sub.createdAt)}
                  </p>
                </div>
              </Link>
            ))}
            <div className="mt-6 text-center text-gray-400">
              <p className="text-lg font-semibold">{subscribers.length} total subscribers</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Subscribers;
