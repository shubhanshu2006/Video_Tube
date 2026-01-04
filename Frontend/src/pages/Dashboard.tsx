import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dashboardApi } from "../api/dashboard";
import { videoApi } from "../api/video";
import { Link } from "react-router-dom";
import {
  Eye,
  ThumbsUp,
  Video,
  Users,
  Edit,
  Trash2,
  Globe,
  GlobeLock,
  MessageSquare,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

const Dashboard = () => {
  const queryClient = useQueryClient();
  const [deletingVideoId, setDeletingVideoId] = useState<string | null>(null);

  const togglePublishMutation = useMutation({
    mutationFn: (videoId: string) => videoApi.togglePublishStatus(videoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channelVideos"] });
      toast.success("Video status updated");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err.response?.data?.message || "Failed to update video status"
      );
    },
  });

  const deleteVideoMutation = useMutation({
    mutationFn: (videoId: string) => videoApi.deleteVideo(videoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channelVideos"] });
      queryClient.invalidateQueries({ queryKey: ["channelStats"] });
      setDeletingVideoId(null);
      toast.success("Video deleted successfully");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to delete video");
      setDeletingVideoId(null);
    },
  });

  const handleDeleteVideo = (videoId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this video? This action cannot be undone."
      )
    ) {
      setDeletingVideoId(videoId);
      deleteVideoMutation.mutate(videoId);
    }
  };

  const { data: statsData } = useQuery({
    queryKey: ["channelStats"],
    queryFn: dashboardApi.getChannelStats,
  });

  const { data: videosData } = useQuery({
    queryKey: ["channelVideos"],
    queryFn: () => dashboardApi.getChannelVideos(),
  });

  const stats = statsData?.data;
  const videos = videosData?.data?.videos || [];

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              Dashboard
            </h1>
            <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-[10px]">
              Manage your content and track performance
            </p>
          </div>
          <Link
            to="/upload"
            className="px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:from-red-600 hover:to-orange-600 transition-all duration-300 shadow-xl shadow-red-900/20 flex items-center justify-center gap-3 group"
          >
            <Video className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Upload Video
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-16">
          {[
            { label: "Total Views", value: stats?.totalViews || 0, icon: Eye, color: "from-red-600 to-orange-600" },
            { label: "Total Likes", value: stats?.totalLikes || 0, icon: ThumbsUp, color: "from-indigo-600 to-violet-600" },
            { label: "Comments", value: stats?.totalComments || 0, icon: MessageSquare, color: "from-violet-600 to-purple-600" },
            { label: "Videos", value: stats?.totalVideos || 0, icon: Video, color: "from-purple-600 to-fuchsia-600" },
            { label: "Subscribers", value: stats?.totalSubscribers || 0, icon: Users, color: "from-fuchsia-600 to-pink-600" },
          ].map((stat, i) => (
            <div
              key={i}
              className="relative p-8 rounded-3xl border border-white/5 overflow-hidden group hover:border-white/10 transition-all duration-500 bg-gradient-to-br from-slate-900/90 via-slate-800/50 to-slate-900/90 backdrop-blur-xl shadow-2xl"
            >
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-10 blur-3xl group-hover:opacity-20 transition-opacity`}></div>
              <stat.icon className="w-8 h-8 text-slate-500 mb-6 group-hover:text-white transition-colors" />
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">
                {stat.label}
              </p>
              <p className="text-3xl font-black text-white tracking-tighter">
                {stat.value.toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-white tracking-tight">
            Your Videos
          </h2>
          <div className="h-px flex-1 bg-white/5 mx-8 hidden md:block"></div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            {videos.length} Total Videos
          </span>
        </div>

        <div className="glass rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Video</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Views</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {videos.map((video: any) => (
                  <tr key={video._id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-6">
                        <div className="relative w-32 aspect-video rounded-xl overflow-hidden shadow-lg">
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                        </div>
                        <Link
                          to={`/video/${video._id}`}
                          className="font-black text-white hover:text-red-500 transition-colors line-clamp-2 max-w-xs leading-tight"
                        >
                          {video.title}
                        </Link>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <button
                        onClick={() => togglePublishMutation.mutate(video._id)}
                        disabled={togglePublishMutation.isPending}
                        className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                          video.isPublished
                            ? "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20"
                            : "bg-slate-800 text-slate-400 border border-white/5 hover:bg-slate-700"
                        }`}
                      >
                        {video.isPublished ? (
                          <><Globe className="w-3.5 h-3.5" /> Published</>
                        ) : (
                          <><GlobeLock className="w-3.5 h-3.5" /> Private</>
                        )}
                      </button>
                    </td>
                    <td className="px-8 py-6">
                      <span className="font-black text-slate-300 tracking-tighter">{video.views.toLocaleString()}</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                        {new Date(video.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/video/${video._id}/edit`}
                          className="p-3 glass rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
                          title="Edit Video"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteVideo(video._id)}
                          disabled={deletingVideoId === video._id}
                          className="p-3 glass rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all disabled:opacity-50"
                          title="Delete Video"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {videos.length === 0 && (
            <div className="text-center py-24">
              <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
                <Video className="w-10 h-10 text-slate-700" />
              </div>
              <h3 className="text-xl font-black text-white mb-2 tracking-tighter">No videos found</h3>
              <p className="text-slate-500 font-medium mb-8">Start your journey by uploading your first video.</p>
              <Link
                to="/upload"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:from-red-600 hover:to-orange-600 transition-all duration-500 shadow-lg shadow-red-900/20"
              >
                Upload Now
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
