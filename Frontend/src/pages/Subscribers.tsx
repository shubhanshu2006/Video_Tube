import { useQuery } from '@tanstack/react-query';
import { subscriptionApi } from '../api/subscription';
import { useAuth } from '../hooks/useAuth';
import { Users, ArrowRight } from 'lucide-react';
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
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-red-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-red-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-600/10 rounded-full border border-red-500/20">
              <Users className="w-4 h-4 text-red-500" />
              <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">Community</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter">
              Subscribers
            </h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] max-w-md leading-relaxed">
              Manage and connect with the people who follow your creative journey and support your content.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="glass px-8 py-6 rounded-[2rem] border border-white/5 flex flex-col items-center justify-center min-w-[160px] relative overflow-hidden group">
              <div className="absolute inset-0 bg-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="text-4xl font-black text-white mb-1 relative z-10">{subscribers.length}</span>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest relative z-10">Total Fans</span>
            </div>
          </div>
        </div>

        {subscribers.length === 0 ? (
          <div className="text-center py-32 glass rounded-[3rem] border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-red-600/10 blur-[100px]"></div>
            <div className="relative z-10">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/5">
                <Users className="w-12 h-12 text-slate-700" />
              </div>
              <h3 className="text-3xl font-black text-white tracking-tight mb-4">No subscribers yet</h3>
              <p className="text-slate-500 font-medium max-w-xs mx-auto mb-10">Your community is waiting to be built. Start sharing your videos to attract your first fans!</p>
              <Link to="/upload" className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:from-red-600 hover:to-orange-600 transition-all shadow-2xl shadow-red-500/20">
                Upload Your First Video
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {subscribers.map((sub: Subscriber) => (
              <Link
                key={sub._id}
                to={`/channel/${sub.subscriber.username}`}
                className="glass flex items-center gap-6 p-8 rounded-[2.5rem] border border-white/5 hover:border-red-500/30 transition-all duration-500 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/5 blur-[60px] -mr-24 -mt-24 group-hover:bg-red-600/10 transition-colors"></div>
                
                <div className="relative shrink-0">
                  <img
                    src={sub.subscriber.avatar}
                    alt={sub.subscriber.fullName}
                    className="w-24 h-24 rounded-[2rem] object-cover ring-4 ring-white/5 group-hover:ring-red-500/20 transition-all duration-500 shadow-2xl"
                  />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl border-4 border-[#0f172a] flex items-center justify-center shadow-xl">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                </div>

                <div className="flex-1 min-w-0 relative z-10">
                  <h3 className="text-2xl font-black text-white group-hover:text-red-400 transition-colors truncate tracking-tight">
                    {sub.subscriber.fullName}
                  </h3>
                  <p className="text-red-500 font-black text-[10px] uppercase tracking-[0.2em] mb-4">
                    @{sub.subscriber.username}
                  </p>
                  <div className="flex items-center gap-2 text-slate-500">
                    <span className="text-[10px] font-bold uppercase tracking-widest">Joined</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{formatDate(sub.createdAt)}</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 text-slate-500 group-hover:bg-gradient-to-r group-hover:from-red-500 group-hover:to-orange-500 group-hover:text-white transition-all duration-500">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Subscribers;
