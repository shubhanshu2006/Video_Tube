import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { videoApi } from "../api/video";
import type { Video as VideoType } from "../types";
import { Play, Eye, Clock } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

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

const formatDate = (date: string) => {
  const now = new Date();
  const videoDate = new Date(date);
  const diffInMs = now.getTime() - videoDate.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
};

const Home = () => {
  const [page, setPage] = useState(1);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  const { data, isLoading, error } = useQuery({
    queryKey: ["videos", page, searchQuery],
    queryFn: () =>
      videoApi.getAllVideos({ page, limit: 12, query: searchQuery }),
  });

  const videos = data?.data?.videos || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Search Results Header */}
        {searchQuery && (
          <div className="mb-8 p-6 bg-gradient-to-r from-gray-800/50 to-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50">
            <h2 className="text-2xl font-bold text-white">
              Search results for:{" "}
              <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent font-extrabold">
                "{searchQuery}"
              </span>
            </h2>
          </div>
        )}

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
        ) : error ? (
          <div className="text-center text-red-500 py-12">
            <p>Failed to load videos</p>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-xl">No videos found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {videos.map((video: VideoType) => (
                <Link
                  key={video._id}
                  to={`/video/${video._id}`}
                  className="group cursor-pointer"
                >
                  <div className="relative overflow-hidden rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 shadow-xl hover:shadow-2xl hover:shadow-red-500/30 hover:border-red-500/30 transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.02]">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute bottom-2 right-2 bg-black/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs text-white flex items-center font-semibold">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatDuration(video.duration)}
                    </div>
                  </div>

                  <div className="mt-3 flex">
                    {video.owner && (
                      <img
                        src={video.owner.avatar}
                        alt={video.owner.fullName}
                        className="w-10 h-10 rounded-full mr-3 ring-2 ring-red-500/20 group-hover:ring-red-500/50 transition-all"
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
                        <span className="mx-1">•</span>
                        <span>{formatDate(video.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {data?.data && data.data.totalPages > 1 && (
              <div className="flex justify-center mt-8 space-x-4">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                  className="px-6 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gradient-to-r hover:from-red-500 hover:to-orange-500 hover:border-transparent transition-all duration-300 shadow-lg hover:shadow-red-500/30 transform hover:-translate-y-0.5 font-semibold"
                >
                  Previous
                </button>
                <span className="px-6 py-3 bg-gradient-to-r from-red-500/20 to-orange-500/20 backdrop-blur-sm border border-red-500/30 text-white rounded-xl font-bold">
                  Page {page} of {data.data.totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= data.data.totalPages}
                  className="px-6 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gradient-to-r hover:from-red-500 hover:to-orange-500 hover:border-transparent transition-all duration-300 shadow-lg hover:shadow-red-500/30 transform hover:-translate-y-0.5 font-semibold"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
