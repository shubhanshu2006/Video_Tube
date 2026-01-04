import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { playlistApi } from "../api/playlist";
import { useAuth } from "../hooks/useAuth";
import type { Video } from "../types";
import { PlaySquare, Eye, Clock, ArrowLeft, Play, Trash2, Share2 } from "lucide-react";
import toast from "react-hot-toast";

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

const PlaylistDetail = () => {
  const { playlistId } = useParams<{ playlistId: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["playlist", playlistId],
    queryFn: () => playlistApi.getPlaylistById(playlistId!),
    enabled: !!playlistId,
  });

  const removeVideoMutation = useMutation({
    mutationFn: ({
      playlistId,
      videoId,
    }: {
      playlistId: string;
      videoId: string;
    }) => playlistApi.removeVideoFromPlaylist(playlistId, videoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlist", playlistId] });
      queryClient.invalidateQueries({ queryKey: ["user-playlists"] });
      toast.success("Video removed from playlist");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to remove video");
    },
  });

  const handleRemoveVideo = (videoId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("Remove this video from the playlist?")) {
      removeVideoMutation.mutate({ playlistId: playlistId!, videoId });
    }
  };

  const playlist = data?.data;
  const isOwner = user && playlist?.owner?._id === user._id;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">
        <div className="text-center glass p-12 rounded-[3rem] border border-white/5">
          <PlaySquare className="w-24 h-24 text-slate-800 mx-auto mb-8 opacity-20" />
          <h2 className="text-3xl font-black tracking-tight">Playlist not found</h2>
          <Link to="/playlists" className="mt-8 inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20">
            <ArrowLeft className="w-4 h-4" />
            Back to Playlists
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200">
      <div className="container mx-auto px-4 py-12">
        <Link
          to="/playlists"
          className="inline-flex items-center gap-3 text-slate-500 hover:text-white mb-12 transition-all group"
        >
          <div className="p-2 rounded-xl bg-white/5 group-hover:bg-blue-600/20 transition-colors">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Back to Playlists</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Playlist Info Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass rounded-[3rem] p-8 border border-white/5 sticky top-32 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[80px] -mr-32 -mt-32"></div>
              
              <div className="relative aspect-video rounded-3xl overflow-hidden mb-8 shadow-2xl group">
                {playlist.videos && playlist.videos.length > 0 ? (
                  <img
                    src={playlist.videos[0].thumbnail}
                    alt={playlist.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                    <PlaySquare className="w-16 h-16 text-slate-800" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60"></div>
                <div className="absolute bottom-4 right-4 px-4 py-2 glass rounded-xl border border-white/10">
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {playlist.videos?.length || 0} Videos
                  </span>
                </div>
              </div>

              <h1 className="text-3xl font-black text-white tracking-tight mb-4 leading-tight">
                {playlist.name}
              </h1>
              
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                {playlist.description || "No description provided for this playlist."}
              </p>

              <div className="flex items-center gap-4 mb-8 p-4 bg-white/5 rounded-2xl border border-white/5">
                <img
                  src={playlist.owner.avatar}
                  alt={playlist.owner.fullName}
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-white/10"
                />
                <div>
                  <p className="text-xs font-black text-white uppercase tracking-widest">{playlist.owner.fullName}</p>
                  <p className="text-[10px] text-slate-500 font-bold">@{playlist.owner.username}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button className="w-full py-4 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-50 transition-all flex items-center justify-center gap-2 shadow-xl shadow-white/5">
                  <Play className="w-4 h-4 fill-current" />
                  Play All
                </button>
                <button className="w-full py-4 bg-white/5 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all flex items-center justify-center gap-2 border border-white/5">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>
          </div>

          {/* Videos List */}
          <div className="lg:col-span-2 space-y-4">
            {playlist.videos && playlist.videos.length > 0 ? (
              playlist.videos.map((video: Video, index: number) => (
                <div
                  key={video._id}
                  className="group glass rounded-[2rem] p-4 border border-white/5 hover:border-blue-500/30 transition-all duration-500 flex flex-col sm:flex-row gap-6 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="flex items-center gap-4">
                    <span className="text-slate-600 font-black text-sm w-4 text-center">{index + 1}</span>
                    <Link to={`/video/${video._id}`} className="relative aspect-video w-full sm:w-48 rounded-2xl overflow-hidden flex-shrink-0 shadow-xl">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                      <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 backdrop-blur-md rounded-lg text-[10px] font-black text-white">
                        {formatDuration(video.duration)}
                      </div>
                    </Link>
                  </div>

                  <div className="flex-1 flex flex-col justify-center min-w-0">
                    <Link to={`/video/${video._id}`}>
                      <h3 className="text-lg font-black text-white tracking-tight mb-2 group-hover:text-blue-400 transition-colors truncate">
                        {video.title}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-4 text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{formatViews(video.views)} views</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                          {new Date(video.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {isOwner && (
                    <div className="flex items-center pr-4">
                      <button
                        onClick={(e) => handleRemoveVideo(video._id, e)}
                        disabled={removeVideoMutation.isPending}
                        className="p-3 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                        title="Remove from playlist"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-32 glass rounded-[3rem] border border-white/5">
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8">
                  <PlaySquare className="w-12 h-12 text-slate-700" />
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight mb-2">This playlist is empty</h3>
                <p className="text-slate-500 text-sm">Start adding videos to see them here</p>
                <Link to="/" className="mt-8 inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-50 transition-all">
                  Explore Videos
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaylistDetail;
