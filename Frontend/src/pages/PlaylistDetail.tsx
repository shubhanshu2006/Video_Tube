import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { playlistApi } from "../api/playlist";
import { useAuth } from "../hooks/useAuth";
import type { Video } from "../types";
import { PlaySquare, Eye, Clock, ArrowLeft, X } from "lucide-react";
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 flex items-center justify-center text-white">
        <p className="text-xl">Playlist not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <Link
          to="/playlists"
          className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Playlists
        </Link>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-700/50 shadow-xl">
          <div className="flex items-start space-x-6">
            <div className="flex-shrink-0">
              {playlist.videos?.[0]?.thumbnail ? (
                <img
                  src={playlist.videos[0].thumbnail}
                  alt={playlist.name}
                  className="w-64 h-36 object-cover rounded-lg"
                />
              ) : (
                <div className="w-64 h-36 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <PlaySquare className="w-16 h-16 text-white opacity-50" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{playlist.name}</h1>
              <p className="text-gray-400 mb-4">{playlist.description}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span>{playlist.videos?.length || 0} videos</span>
                {playlist.totalViews !== undefined && (
                  <>
                    <span>•</span>
                    <span>{formatViews(playlist.totalViews)} views</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {playlist.videos && playlist.videos.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Videos
            </h2>
            {playlist.videos.map((video: Video, index: number) => (
              <div
                key={video._id}
                className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50 hover:border-gray-600/50 shadow-xl hover:shadow-2xl transition-all duration-300 relative group transform hover:-translate-y-1"
              >
                <Link
                  to={`/video/${video._id}`}
                  className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 flex-1"
                >
                  <div className="flex-shrink-0 flex items-start space-x-4">
                    <span className="text-gray-400 text-lg font-semibold w-8">
                      {index + 1}
                    </span>
                    <div className="relative">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full md:w-48 h-28 object-cover rounded-lg"
                      />
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 px-2 py-1 rounded text-xs">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {formatDuration(video.duration)}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold line-clamp-2 hover:text-red-400 transition-colors">
                      {video.title}
                    </h3>
                    {video.owner && (
                      <p className="text-gray-400 text-sm mt-2">
                        {video.owner.fullName}
                      </p>
                    )}
                    <div className="flex items-center text-gray-400 text-sm mt-2">
                      <Eye className="w-4 h-4 mr-1" />
                      <span>{formatViews(video.views)} views</span>
                    </div>
                  </div>
                </Link>
                {isOwner && (
                  <button
                    onClick={(e) => handleRemoveVideo(video._id, e)}
                    className="absolute top-4 right-4 p-2 bg-red-600 rounded-full hover:bg-red-700 transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove from playlist"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <PlaySquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-xl">No videos in this playlist</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistDetail;
