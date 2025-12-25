import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api/auth";
import { videoApi } from "../api/video";
import { tweetApi } from "../api/tweet";
import { playlistApi } from "../api/playlist";
import { subscriptionApi } from "../api/subscription";
import { likeApi } from "../api/like";
import { commentApi } from "../api/comment";
import { useAuth } from "../hooks/useAuth";
import { useState } from "react";
import {
  Video,
  Users,
  Grid,
  List,
  MessageSquare,
  Camera,
  Settings,
  ThumbsUp,
  Send,
} from "lucide-react";
import toast from "react-hot-toast";
import type { Comment } from "../types";

const Channel = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "videos" | "playlists" | "community"
  >("videos");
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>(
    {}
  );
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [loadingComments, setLoadingComments] = useState<
    Record<string, boolean>
  >({});
  const [tweetComments, setTweetComments] = useState<Record<string, Comment[]>>(
    {}
  );

  const { data: channelData, isLoading } = useQuery({
    queryKey: ["channel", username],
    queryFn: () => authApi.getChannelProfile(username!),
    enabled: !!username,
  });

  const { data: videosData } = useQuery({
    queryKey: ["channelVideos", username],
    queryFn: () => videoApi.getAllVideos({ userId: channelData?.data._id }),
    enabled: !!channelData?.data?._id && activeTab === "videos",
  });

  const { data: playlistsData } = useQuery({
    queryKey: ["userPlaylists", channelData?.data?._id],
    queryFn: () => {
      if (channelData?.data?._id) {
        return playlistApi.getUserPlaylists(channelData.data._id);
      }
      return Promise.reject("No user ID");
    },
    enabled: !!channelData?.data?._id && activeTab === "playlists",
  });

  const { data: tweetsData } = useQuery({
    queryKey: ["userTweets", channelData?.data?._id],
    queryFn: () => {
      if (channelData?.data?._id) {
        return tweetApi.getUserTweets(channelData.data._id);
      }
      return Promise.reject("No user ID");
    },
    enabled: !!channelData?.data?._id && activeTab === "community",
  });

  const subscribeToggleMutation = useMutation({
    mutationFn: () => {
      if (!channelData?.data?._id) throw new Error("No channel ID");
      return subscriptionApi.toggleSubscription(channelData.data._id);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["channel", username] });
      queryClient.invalidateQueries({ queryKey: ["subscribedChannels"] });
      toast.success(data.data.subscribed ? "Subscribed" : "Unsubscribed");
    },
    onError: () => {
      toast.error("Failed to toggle subscription");
    },
  });

  const likeTweetMutation = useMutation({
    mutationFn: (tweetId: string) => likeApi.toggleTweetLike(tweetId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["userTweets", channelData?.data?._id],
      });
    },
    onError: () => {
      toast.error("Failed to like post");
    },
  });

  const addTweetCommentMutation = useMutation({
    mutationFn: ({ tweetId, content }: { tweetId: string; content: string }) =>
      commentApi.addTweetComment(tweetId, content),
    onSuccess: (_, variables) => {
      setCommentInputs((prev) => ({ ...prev, [variables.tweetId]: "" }));
      toast.success("Comment added");
      // Reload comments for this tweet
      loadTweetComments(variables.tweetId);
    },
    onError: () => {
      toast.error("Failed to add comment");
    },
  });

  const loadTweetComments = async (tweetId: string) => {
    setLoadingComments((prev) => ({ ...prev, [tweetId]: true }));
    try {
      const response = await commentApi.getTweetComments(tweetId, {
        page: 1,
        limit: 10,
      });
      setTweetComments((prev) => ({ ...prev, [tweetId]: response.data.docs }));
    } catch (error) {
      console.error("Failed to load comments:", error);
    } finally {
      setLoadingComments((prev) => ({ ...prev, [tweetId]: false }));
    }
  };

  const handleToggleComments = (tweetId: string) => {
    const newShowState = !showComments[tweetId];
    setShowComments((prev) => ({ ...prev, [tweetId]: newShowState }));

    // Load comments when opening comment section for the first time
    if (newShowState && !tweetComments[tweetId]) {
      loadTweetComments(tweetId);
    }
  };

  const isOwnChannel = user?.username === username;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  const channel = channelData?.data;
  if (!channel) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-white text-xl">Channel not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white">
      <div className="h-48 md:h-64 bg-gradient-to-r from-red-900 via-red-800 to-orange-900 relative shadow-2xl">
        {channel.coverImage ? (
          <img
            src={channel.coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          isOwnChannel && (
            <div className="w-full h-full flex items-center justify-center">
              <button
                onClick={() => navigate("/settings")}
                className="flex flex-col items-center space-y-2 text-gray-400 hover:text-white transition-colors"
              >
                <Camera className="w-12 h-12" />
                <span>Add Cover Photo</span>
              </button>
            </div>
          )
        )}
        {isOwnChannel && channel.coverImage && (
          <button
            onClick={() => navigate("/settings")}
            className="absolute top-4 right-4 p-2 bg-gray-900 bg-opacity-75 rounded-full hover:bg-opacity-100 transition-all"
            title="Edit Cover Photo"
          >
            <Settings className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-4 -mt-20 md:-mt-24 mb-8 relative">
          <div className="relative z-10">
            <img
              src={channel.avatar}
              alt={channel.fullName}
              className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-gray-900 shadow-2xl bg-gray-800 ring-2 ring-red-500/20"
            />
            {isOwnChannel && (
              <button
                onClick={() => navigate("/settings")}
                className="absolute bottom-0 right-0 p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                title="Edit Avatar"
              >
                <Camera className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="md:ml-6 mt-4 md:mt-0 text-center md:text-left flex-1 bg-gray-900 bg-opacity-90 backdrop-blur-sm p-4 rounded-lg">
            <h1 className="text-3xl font-bold text-white drop-shadow-lg">
              {channel.fullName}
            </h1>
            <p className="text-gray-300 mt-1 drop-shadow">
              @{channel.username}
            </p>
            <div className="flex items-center justify-center md:justify-start space-x-4 mt-2 text-sm text-gray-300">
              <div className="flex items-center drop-shadow">
                <Users className="w-4 h-4 mr-1" />
                <span>
                  {(
                    channelData.data as unknown as { subscribersCount?: number }
                  ).subscribersCount || 0}{" "}
                  subscribers
                </span>
              </div>
            </div>
          </div>
          {!isOwnChannel && (
            <button
              onClick={() => subscribeToggleMutation.mutate()}
              disabled={subscribeToggleMutation.isPending}
              className={`mt-4 md:mt-0 px-8 py-3 rounded-full font-semibold transition-all duration-300 disabled:opacity-50 shadow-lg transform hover:-translate-y-0.5 ${
                (channelData.data as unknown as { isSubscribed?: boolean })
                  .isSubscribed
                  ? "bg-gray-700 text-white hover:bg-gray-600 hover:shadow-gray-500/30"
                  : "bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600 hover:shadow-red-500/30"
              }`}
            >
              {(channelData.data as unknown as { isSubscribed?: boolean })
                .isSubscribed
                ? "Subscribed"
                : "Subscribe"}
            </button>
          )}
          {isOwnChannel && (
            <button
              onClick={() => navigate("/settings")}
              className="mt-4 md:mt-0 px-6 py-3 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-all duration-300 font-semibold flex items-center gap-2 shadow-lg hover:shadow-gray-500/30 transform hover:-translate-y-0.5"
            >
              <Settings className="w-4 h-4" />
              Edit Profile
            </button>
          )}
        </div>

        <div className="border-b border-gray-700 mb-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("videos")}
              className={`pb-4 px-2 flex items-center space-x-2 transition-colors ${
                activeTab === "videos"
                  ? "border-b-2 border-red-500 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Video className="w-5 h-5" />
              <span>Videos</span>
            </button>
            <button
              onClick={() => setActiveTab("playlists")}
              className={`pb-4 px-2 flex items-center space-x-2 transition-colors ${
                activeTab === "playlists"
                  ? "border-b-2 border-red-500 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <List className="w-5 h-5" />
              <span>Playlists</span>
            </button>
            <button
              onClick={() => setActiveTab("community")}
              className={`pb-4 px-2 flex items-center space-x-2 transition-colors ${
                activeTab === "community"
                  ? "border-b-2 border-red-500 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              <span>Community</span>
            </button>
          </div>
        </div>

        <div className="pb-12">
          {activeTab === "videos" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {videosData?.data?.videos?.map(
                (video: {
                  _id: string;
                  thumbnail: string;
                  title: string;
                  views: number;
                }) => (
                  <Link
                    key={video._id}
                    to={`/watch/${video._id}`}
                    className="group cursor-pointer"
                  >
                    <div className="relative overflow-hidden rounded-xl bg-gray-800 shadow-lg hover:shadow-red-500/20 transition-all duration-300 transform hover:-translate-y-1">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="mt-3 text-white font-semibold line-clamp-2 group-hover:text-red-400 transition-colors">
                      {video.title}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">
                      {video.views} views
                    </p>
                  </Link>
                )
              )}
            </div>
          )}

          {activeTab === "playlists" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {playlistsData?.data?.map(
                (playlist: {
                  _id: string;
                  name: string;
                  description: string;
                  videos: unknown[];
                }) => (
                  <div
                    key={playlist._id}
                    className="bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-red-500/20 transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <Grid className="w-8 h-8 text-red-500" />
                      <span className="text-sm text-gray-400">
                        {playlist.videos.length} videos
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      {playlist.name}
                    </h3>
                    <p className="text-gray-400 text-sm line-clamp-2">
                      {playlist.description}
                    </p>
                  </div>
                )
              )}
            </div>
          )}

          {activeTab === "community" && (
            <div className="space-y-4 max-w-2xl">
              {tweetsData?.data?.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-xl">No community posts yet</p>
                </div>
              ) : (
                tweetsData?.data?.map(
                  (tweet: {
                    _id: string;
                    content: string;
                    createdAt: string;
                    likesCount?: number;
                    isLiked?: boolean;
                    commentsCount?: number;
                  }) => (
                    <div
                      key={tweet._id}
                      className="bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-red-500/20 transition-all duration-300"
                    >
                      <div className="flex items-start space-x-4">
                        <img
                          src={channel.avatar}
                          alt={channel.fullName}
                          className="w-12 h-12 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold">
                              {channel.fullName}
                            </span>
                            <span className="text-gray-400 text-sm">
                              @{channel.username}
                            </span>
                            <span className="text-gray-500 text-xs">
                              · {new Date(tweet.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="mt-2 text-gray-300 whitespace-pre-wrap">
                            {tweet.content}
                          </p>

                          <div className="flex items-center space-x-6 mt-4">
                            <button
                              onClick={() =>
                                likeTweetMutation.mutate(tweet._id)
                              }
                              className={`flex items-center space-x-2 transition-colors ${
                                tweet.isLiked
                                  ? "text-red-500"
                                  : "text-gray-400 hover:text-red-500"
                              }`}
                            >
                              <ThumbsUp
                                className={`w-5 h-5 ${
                                  tweet.isLiked ? "fill-current" : ""
                                }`}
                              />
                              <span className="text-sm">
                                {tweet.likesCount || 0}
                              </span>
                            </button>
                            <button
                              onClick={() => handleToggleComments(tweet._id)}
                              className="flex items-center space-x-2 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <MessageSquare className="w-5 h-5" />
                              <span className="text-sm">
                                {tweetComments[tweet._id]?.length ||
                                  tweet.commentsCount ||
                                  0}{" "}
                                Comment
                                {(tweetComments[tweet._id]?.length ||
                                  tweet.commentsCount ||
                                  0) !== 1
                                  ? "s"
                                  : ""}
                              </span>
                            </button>
                          </div>

                          {showComments[tweet._id] && (
                            <div className="mt-4 pt-4 border-t border-gray-700">
                              {user && (
                                <div className="flex items-start space-x-3 mb-4">
                                  <img
                                    src={user?.avatar}
                                    alt={user?.fullName}
                                    className="w-8 h-8 rounded-full"
                                  />
                                  <div className="flex-1">
                                    <textarea
                                      value={commentInputs[tweet._id] || ""}
                                      onChange={(e) =>
                                        setCommentInputs((prev) => ({
                                          ...prev,
                                          [tweet._id]: e.target.value,
                                        }))
                                      }
                                      placeholder="Add a comment..."
                                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                                      rows={2}
                                    />
                                    <div className="flex justify-end mt-2">
                                      <button
                                        onClick={() => {
                                          const content =
                                            commentInputs[tweet._id]?.trim();
                                          if (content) {
                                            addTweetCommentMutation.mutate({
                                              tweetId: tweet._id,
                                              content,
                                            });
                                          }
                                        }}
                                        disabled={
                                          !commentInputs[tweet._id]?.trim() ||
                                          addTweetCommentMutation.isPending
                                        }
                                        className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                                      >
                                        <Send className="w-4 h-4" />
                                        <span>Post</span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {loadingComments[tweet._id] ? (
                                <div className="text-center py-4">
                                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-red-500 mx-auto"></div>
                                </div>
                              ) : tweetComments[tweet._id]?.length > 0 ? (
                                <div className="space-y-4">
                                  {tweetComments[tweet._id].map(
                                    (comment: Comment) => (
                                      <div
                                        key={comment._id}
                                        className="flex items-start space-x-3"
                                      >
                                        <img
                                          src={comment.owner.avatar}
                                          alt={comment.owner.fullName}
                                          className="w-8 h-8 rounded-full"
                                        />
                                        <div className="flex-1">
                                          <div className="bg-gray-700 rounded-lg p-3">
                                            <div className="flex items-center space-x-2 mb-1">
                                              <span className="font-semibold text-sm">
                                                {comment.owner.fullName}
                                              </span>
                                              <span className="text-gray-400 text-xs">
                                                {new Date(
                                                  comment.createdAt
                                                ).toLocaleDateString()}
                                              </span>
                                            </div>
                                            <p className="text-gray-300 text-sm">
                                              {comment.content}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              ) : (
                                <p className="text-gray-500 text-sm text-center py-4">
                                  No comments yet. Be the first to comment!
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Channel;
