import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api/auth";
import { Link } from "react-router-dom";
import { Clock, Eye, History, X, Play } from "lucide-react";
import toast from "react-hot-toast";
import type { Video } from "../types";

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

const WatchHistory = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["watchHistory"],
    queryFn: authApi.getWatchHistory,
  });

  const removeMutation = useMutation({
    mutationFn: (videoId: string) => authApi.removeFromWatchHistory(videoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchHistory"] });
      toast.success("Removed from watch history");
    },
  });

  const videos = data?.data || [];

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-slate-200 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Error Loading Watch History</h2>
          <p className="text-slate-400">{(error as Error).message || "Something went wrong"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-600/10 rounded-full border border-red-500/20">
              <History className="w-3.5 h-3.5 text-red-500" />
              <span className="text-[9px] font-black text-red-500 uppercase tracking-[0.2em]">Activity</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Watch History
            </h1>
            <p className="text-slate-500 font-medium text-xs max-w-md">
              Review your recently watched content and pick up right where you left off.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="glass px-6 py-4 rounded-xl border border-white/5 flex flex-col items-center justify-center min-w-[120px] relative overflow-hidden group">
              <div className="absolute inset-0 bg-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="text-2xl font-black text-white mb-1 relative z-10">{videos.length}</span>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest relative z-10">Total Views</span>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="glass rounded-[2.5rem] p-8 animate-pulse border border-white/5 flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-80 aspect-video bg-white/5 rounded-2xl"></div>
                <div className="flex-1 space-y-4">
                  <div className="h-8 bg-white/5 rounded-xl w-3/4"></div>
                  <div className="h-4 bg-white/5 rounded-lg w-1/2"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-white/5 rounded-lg w-full"></div>
                    <div className="h-4 bg-white/5 rounded-lg w-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-32 glass rounded-[3rem] border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-red-600/10 blur-[100px]"></div>
            <div className="relative z-10">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/5">
                <History className="w-12 h-12 text-slate-700" />
              </div>
              <h3 className="text-3xl font-black text-white tracking-tight mb-4">History is empty</h3>
              <p className="text-slate-500 font-medium max-w-xs mx-auto mb-10">You haven't watched any videos yet. Start exploring to build your history!</p>
              <Link to="/" className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:from-red-600 hover:to-orange-600 transition-all shadow-2xl shadow-red-500/20">
                Explore Videos
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {videos.map((video: Video) => (
              <div
                key={video._id}
                className="group relative glass rounded-xl p-3 border border-white/5 hover:border-red-500/30 transition-all duration-500 flex flex-col md:flex-row gap-4 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 blur-[100px] -mr-48 -mt-48 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                
                <Link
                  to={`/video/${video._id}`}
                  className="relative flex-shrink-0 w-full md:w-64 aspect-video rounded-xl overflow-hidden shadow-2xl group/thumb"
                >
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
                </Link>

                <div className="flex-1 flex flex-col justify-center min-w-0 relative z-10">
                  <div className="flex justify-between items-start gap-3 mb-2">
                    <Link to={`/video/${video._id}`} className="flex-1">
                      <h3 className="text-lg font-black text-white tracking-tight group-hover:text-red-400 transition-colors line-clamp-2 leading-tight">
                        {video.title}
                      </h3>
                    </Link>
                    <button
                      onClick={() => removeMutation.mutate(video._id)}
                      className="p-3 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"
                      title="Remove from history"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4 mb-6">
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchHistory;
