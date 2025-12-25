import { useQuery } from "@tanstack/react-query";
import { likeApi } from "../api/like";
import { Link } from "react-router-dom";
import { ThumbsUp, Eye, Clock } from "lucide-react";

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
  const { data, isLoading } = useQuery({
    queryKey: ["likedVideos"],
    queryFn: likeApi.getLikedVideos,
  });

  const videos = data?.data || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center space-x-3 mb-8">
          <ThumbsUp className="w-8 h-8 text-red-500" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Liked Videos
          </h1>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-800 h-48 rounded-xl"></div>
                <div className="mt-3 space-y-2">
                  <div className="h-4 bg-gray-800 rounded"></div>
                  <div className="h-3 bg-gray-800 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <ThumbsUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-xl">No liked videos yet</p>
            <p className="text-sm mt-2">
              Start liking videos to see them here!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video) => (
              <Link
                key={video._id}
                to={`/video/${video._id}`}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 shadow-xl hover:shadow-2xl hover:shadow-red-500/20 hover:border-gray-600/50 transition-all duration-300 transform hover:-translate-y-2 hover:scale-105">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 px-2 py-1 rounded text-xs text-white flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatDuration(video.duration)}
                  </div>
                </div>

                <div className="mt-3 flex">
                  {video.owner && (
                    <img
                      src={video.owner.avatar}
                      alt={video.owner.fullName}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-white font-semibold line-clamp-2 group-hover:text-red-400 transition-colors">
                      {video.title}
                    </h3>
                    {video.owner && (
                      <p className="text-gray-400 text-sm mt-1">
                        {video.owner.fullName}
                      </p>
                    )}
                    <div className="flex items-center text-gray-400 text-sm mt-1">
                      <Eye className="w-3 h-3 mr-1" />
                      <span>{formatViews(video.views)} views</span>
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
