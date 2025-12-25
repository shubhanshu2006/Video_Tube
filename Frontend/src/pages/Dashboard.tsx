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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl p-6 shadow-2xl hover:shadow-red-500/40 transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 border border-red-400/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">Total Views</p>
                <p className="text-3xl font-bold mt-2">
                  {stats?.totalViews || 0}
                </p>
              </div>
              <Eye className="w-12 h-12 text-red-100 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl p-6 shadow-2xl hover:shadow-pink-500/40 transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 border border-pink-400/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-100 text-sm">Total Likes</p>
                <p className="text-3xl font-bold mt-2">
                  {stats?.totalLikes || 0}
                </p>
              </div>
              <ThumbsUp className="w-12 h-12 text-pink-100 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-6 shadow-2xl hover:shadow-orange-500/40 transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 border border-orange-400/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Total Comments</p>
                <p className="text-3xl font-bold mt-2">
                  {stats?.totalComments || 0}
                </p>
              </div>
              <MessageSquare className="w-12 h-12 text-orange-100 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 border border-blue-400/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Videos</p>
                <p className="text-3xl font-bold mt-2">
                  {stats?.totalVideos || 0}
                </p>
              </div>
              <Video className="w-12 h-12 text-blue-100 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-6 shadow-2xl hover:shadow-green-500/40 transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 border border-green-400/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Subscribers</p>
                <p className="text-3xl font-bold mt-2">
                  {stats?.totalSubscribers || 0}
                </p>
              </div>
              <Users className="w-12 h-12 text-green-100 opacity-50" />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent\">
            Your Videos
          </h2>
          <Link
            to="/upload"
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:from-red-600 hover:to-orange-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-red-500/30 transform hover:-translate-y-0.5"
          >
            Upload Video
          </Link>
        </div>

        <div className="bg-gray-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Video
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Views
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {videos.map(
                  (video: {
                    _id: string;
                    thumbnail: string;
                    title: string;
                    isPublished: boolean;
                    views: number;
                    createdAt: string;
                  }) => (
                    <tr
                      key={video._id}
                      className="border-t border-gray-700 hover:bg-gray-750 transition-colors duration-200"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-4">
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-24 h-14 object-cover rounded shadow-md hover:shadow-red-500/20 transition-shadow duration-300"
                          />
                          <div>
                            <Link
                              to={`/video/${video._id}`}
                              className="font-semibold hover:text-red-400 line-clamp-2"
                            >
                              {video.title}
                            </Link>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            video.isPublished
                              ? "bg-green-900 text-green-200"
                              : "bg-gray-700 text-gray-300"
                          }`}
                        >
                          {video.isPublished ? (
                            <>
                              <Globe className="w-3 h-3 mr-1" />
                              Published
                            </>
                          ) : (
                            <>
                              <GlobeLock className="w-3 h-3 mr-1" />
                              Private
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4">{video.views}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {new Date(video.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              togglePublishMutation.mutate(video._id)
                            }
                            disabled={togglePublishMutation.isPending}
                            className="p-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors disabled:opacity-50"
                            title={
                              video.isPublished
                                ? "Unpublish video"
                                : "Publish video"
                            }
                          >
                            {video.isPublished ? (
                              <GlobeLock className="w-4 h-4" />
                            ) : (
                              <Globe className="w-4 h-4" />
                            )}
                          </button>
                          <Link
                            to={`/video/${video._id}/edit`}
                            className="p-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
                            title="Edit video"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteVideo(video._id)}
                            disabled={deletingVideoId === video._id}
                            className="p-2 bg-red-600 rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                            title="Delete video"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          {videos.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No videos yet</p>
              <p className="text-sm mt-2">
                Upload your first video to get started!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
