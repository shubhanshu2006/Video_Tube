import { useQuery } from "@tanstack/react-query";
import { likeApi } from "../api/like";
import { Link } from "react-router-dom";
import { ThumbsUp, Eye, Heart, Play, Share2 } from "lucide-react";

const formatViews = (views: number) => {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
  return views.toString();
};

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const LikedVideos = () => {
  const { data } = useQuery({
    queryKey: ["likedVideos"],
    queryFn: likeApi.getLikedVideos,
  });

  const videos = data?.data || [];

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-600/10 rounded-full border border-red-500/20">
              <Heart className="w-4 h-4 text-red-500" />
              <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">Favorites</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter">
              Liked Videos
            </h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] max-w-md leading-relaxed">
              Your personal collection of videos that inspired you, made you laugh, or taught you something new.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="glass px-8 py-6 rounded-[2rem] border border-white/5 flex flex-col items-center justify-center min-w-[160px] relative overflow-hidden group">
              <div className="absolute inset-0 bg-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="text-4xl font-black text-white mb-1 relative z-10">{videos.length}</span>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest relative z-10">Saved Items</span>
            </div>
          </div>
        </div>

        {videos.length === 0 ? (
          <div className="text-center py-32 glass rounded-[3rem] border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-red-600/10 blur-[100px]"></div>
            <div className="relative z-10">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/5">
                <ThumbsUp className="w-12 h-12 text-slate-700" />
              </div>
              <h3 className="text-3xl font-black text-white tracking-tight mb-4">No liked videos yet</h3>
              <p className="text-slate-500 font-medium max-w-xs mx-auto mb-10">Start exploring and like videos to build your personal collection!</p>
              <Link to="/" className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:from-red-600 hover:to-orange-600 transition-all shadow-2xl shadow-red-500/20">
                Explore Videos
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {videos.map((video) => (
              <Link
                key={video._id}
                to={`/video/${video._id}`}
                className="group relative animate-fade-in"
              >
                <div className="glass rounded-[2.5rem] overflow-hidden border border-white/5 group-hover:border-red-500/30 transition-all duration-500 shadow-2xl group-hover:-translate-y-2">
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60"></div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-2xl shadow-red-500/50 transform scale-50 group-hover:scale-100 transition-transform duration-500">
                        <Play className="w-6 h-6 text-white fill-current" />
                      </div>
                    </div>
                    <div className="absolute bottom-4 right-4 glass px-3 py-1.5 rounded-xl text-[10px] font-black text-white border border-white/10">
                      {formatDuration(video.duration)}
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-black text-white tracking-tight mb-4 line-clamp-2 group-hover:text-red-400 transition-colors">
                      {video.title}
                    </h3>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={video.owner?.avatar}
                          alt={video.owner?.fullName}
                          className="w-8 h-8 rounded-xl object-cover ring-2 ring-white/5"
                        />
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-white uppercase tracking-widest truncate w-24">
                            {video.owner?.fullName}
                          </span>
                          <div className="flex items-center gap-2 text-slate-500">
                            <Eye className="w-3 h-3" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{formatViews(video.views)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-2 rounded-xl bg-white/5 text-slate-500 group-hover:bg-gradient-to-r group-hover:from-red-500 group-hover:to-orange-500 group-hover:text-white transition-all">
                        <Share2 className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LikedVideos;
