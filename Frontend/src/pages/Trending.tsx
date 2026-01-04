import { useQuery } from "@tanstack/react-query";
import { videoApi } from "../api/video";
import { Link } from "react-router-dom";
import type { Video as VideoType } from "../types";
import { Eye, Clock, TrendingUp, Play, Flame } from "lucide-react";

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const formatViews = (views: number) => {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
  return views.toString();
};

const Trending = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["trendingVideos"],
    queryFn: () =>
      videoApi.getAllVideos({ sortBy: "views", sortType: "desc", limit: 20 }),
  });

  const videos = data?.data?.videos || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-4 border-red-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-red-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-600/10 rounded-full border border-red-500/20">
              <Flame className="w-4 h-4 text-red-500" />
              <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">Hot Now</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter">
              Trending
            </h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] max-w-md leading-relaxed">
              The most popular videos on VideoTube right now, updated every few minutes.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="glass px-8 py-6 rounded-[2rem] border border-white/5 flex flex-col items-center justify-center min-w-[160px] relative overflow-hidden group">
              <div className="absolute inset-0 bg-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="text-4xl font-black text-white mb-1 relative z-10">{videos.length}</span>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest relative z-10">Top Hits</span>
            </div>
          </div>
        </div>

        {videos.length === 0 ? (
          <div className="text-center py-32 glass rounded-[3rem] border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-red-600/10 blur-[100px]"></div>
            <div className="relative z-10">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/5">
                <TrendingUp className="w-12 h-12 text-slate-700" />
              </div>
              <h3 className="text-3xl font-black text-white tracking-tight mb-4">Nothing trending</h3>
              <p className="text-slate-500 font-medium max-w-xs mx-auto mb-10">Check back later for popular content that's taking the world by storm.</p>
              <Link to="/" className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:from-red-600 hover:to-orange-600 transition-all shadow-2xl shadow-red-500/20">
                Explore Videos
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {videos.map((video: VideoType, index: number) => (
              <Link
                key={video._id}
                to={`/video/${video._id}`}
                className="group relative glass rounded-xl p-3 border border-white/5 hover:border-red-500/30 transition-all duration-500 flex flex-col md:flex-row gap-4 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 blur-[100px] -mr-48 -mt-48 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-black text-white/5 group-hover:text-red-500/20 transition-colors duration-500 w-8 text-center tracking-tighter">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <div className="relative flex-shrink-0 w-full md:w-64 aspect-video rounded-xl overflow-hidden shadow-2xl group/thumb">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover/thumb:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60"></div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-500">
                      <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-2xl shadow-red-500/50 transform scale-50 group-hover/thumb:scale-100 transition-transform duration-500">
                        <Play className="w-8 h-8 text-white fill-current" />
                      </div>
                    </div>
                    <div className="absolute bottom-4 right-4 glass px-3 py-1.5 rounded-xl text-[10px] font-black text-white border border-white/10">
                      {formatDuration(video.duration)}
                    </div>
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-center min-w-0 relative z-10">
                  <h3 className="text-lg font-black text-white tracking-tight group-hover:text-red-400 transition-colors line-clamp-2 leading-tight mb-2">
                    {video.title}
                  </h3>

                  <div className="flex items-center gap-2 mb-3">
                    <img
                      src={video.owner?.avatar}
                      alt={video.owner?.fullName}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-800"
                    />
                    <div>
                      <p className="text-xs font-black text-white uppercase tracking-widest">{video.owner?.fullName}</p>
                      <p className="text-[10px] text-slate-500 font-bold">@{video.owner?.username}</p>
                    </div>
                  </div>

                  <p className="text-slate-400 text-sm line-clamp-2 mb-6 leading-relaxed">
                    {video.description}
                  </p>

                  <div className="flex items-center gap-6 text-slate-500">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{formatViews(video.views)} views</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        {new Date(video.createdAt).toLocaleDateString()}
                      </span>
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

export default Trending;
