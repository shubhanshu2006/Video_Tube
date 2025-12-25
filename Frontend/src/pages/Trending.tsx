import { useQuery } from "@tanstack/react-query";
import { videoApi } from "../api/video";
import { Link } from "react-router-dom";
import type { Video as VideoType } from "../types";
import { Eye, Clock, TrendingUp } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center space-x-3 mb-8">
          <TrendingUp className="w-8 h-8 text-red-500" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Trending
          </h1>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex space-x-4">
                <div className="bg-gray-800 h-32 w-56 rounded-xl"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-800 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-xl">No trending videos</p>
          </div>
        ) : (
          <div className="space-y-4">
            {videos.map((video: VideoType, index: number) => (
              <Link
                key={video._id}
                to={`/video/${video._id}`}
                className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-red-500/20 transform hover:-translate-y-1"
              >
                <div className="flex items-start space-x-4 md:space-x-0">
                  <div className="text-2xl font-bold text-gray-600 w-8 flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="relative flex-shrink-0">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full md:w-64 h-36 object-cover rounded-lg"
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
                  <div className="flex items-center mt-2 space-x-4 text-sm text-gray-400">
                    {video.owner && (
                      <div className="flex items-center">
                        <img
                          src={video.owner.avatar}
                          alt={video.owner.fullName}
                          className="w-6 h-6 rounded-full mr-2"
                        />
                        <span>{video.owner.fullName}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      <span>{formatViews(video.views)} views</span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                    {video.description}
                  </p>
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
