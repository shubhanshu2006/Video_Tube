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
  List,
  MessageSquare,
  Camera,
  Settings,
  ThumbsUp,
  Send,
} from "lucide-react";
import toast from "react-hot-toast";
import type { Comment, Video as VideoType, Playlist, Tweet } from "../types";

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
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-800 border-t-red-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-red-600/20 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  const channel = channelData?.data;
  if (!channel) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="text-center glass p-12 rounded-[2.5rem] border border-white/5 shadow-2xl">
          <div className="w-24 h-24 bg-slate-800/50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/5">
            <Users className="w-10 h-10 text-slate-500" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tighter mb-2">
            Channel not found
          </h2>
          <p className="text-slate-400 font-medium mb-8">
            The channel you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/"
            className="px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-2xl font-black tracking-tight transition-all shadow-lg shadow-red-900/20 active:scale-95 inline-block"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200">
      {/* Cover Image Section */}
      <div className="h-48 md:h-80 relative overflow-hidden group">
        {channel.coverImage ? (
          <img
            src={channel.coverImage}
            alt="Cover"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
            {isOwnChannel && (
              <button
                onClick={() => navigate("/settings")}
                className="flex flex-col items-center space-y-3 text-slate-500 hover:text-red-500 transition-all duration-500 group"
              >
                <div className="p-4 rounded-full bg-slate-800/50 border border-white/5 group-hover:border-red-500/50">
                  <Camera className="w-8 h-8" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                  Add Cover Photo
                </span>
              </button>
            )}
          </div>
        )}
        {isOwnChannel && channel.coverImage && (
          <button
            onClick={() => navigate("/settings")}
            className="absolute top-6 right-6 p-3 glass rounded-2xl hover:bg-gradient-to-r hover:from-red-500 hover:to-orange-500 transition-all duration-500 group"
            title="Edit Cover Photo"
          >
            <Settings className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-500" />
          </button>
        )}
      </div>

      <div className="container mx-auto px-4">
        {/* Profile Info Section */}
        <div className="flex flex-col md:flex-row items-center md:items-end gap-8 -mt-20 md:-mt-24 mb-12 relative z-10">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-orange-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full bg-[#0f172a]">
              <img
                src={channel.avatar}
                alt={channel.fullName}
                className="w-full h-full rounded-full object-cover border-4 border-[#0f172a] shadow-2xl"
              />
            </div>
            {isOwnChannel && (
              <button
                onClick={() => navigate("/settings")}
                className="absolute bottom-2 right-2 p-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full shadow-xl hover:from-red-600 hover:to-orange-600 transition-all duration-300"
                aria-label="Edit profile picture"
              >
                <Camera className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="flex-1 text-center md:text-left pb-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
              <div>
                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                  {channel.fullName}
                </h1>
                <div className="flex items-center justify-center md:justify-start gap-3 mt-2">
                  <span className="text-slate-400 font-bold">
                    @{channel.username}
                  </span>
                  <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                  <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">
                    {channel.subscribersCount || 0} Subscribers
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-3">
                {isOwnChannel ? (
                  <button
                    onClick={() => navigate("/settings")}
                    className="px-8 py-3.5 glass rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all duration-500"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <button
                    onClick={() => subscribeToggleMutation.mutate()}
                    disabled={subscribeToggleMutation.isPending}
                    className={`px-10 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-500 ${
                      channel.isSubscribed
                        ? "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-white/5"
                        : "bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600 shadow-xl shadow-red-900/20"
                    }`}
                  >
                    {channel.isSubscribed ? "Subscribed" : "Subscribe"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        
        <div className="flex items-center justify-center md:justify-start space-x-2 mb-10 p-1.5 glass rounded-2xl w-fit mx-auto md:mx-0">
          {[
            { id: "videos", label: "Videos", icon: Video },
            { id: "playlists", label: "Playlists", icon: List },
            { id: "community", label: "Community", icon: MessageSquare },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "videos" | "playlists" | "community")}
              className={`flex items-center space-x-2.5 px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-500 ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-900/40"
                  : "text-slate-500 hover:text-white hover:bg-white/5"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Section */}
        <div className="pb-20 animate-fade-in">
          {activeTab === "videos" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {videosData?.data?.videos?.length === 0 ? (
                <div className="col-span-full py-20 text-center glass rounded-3xl border border-white/5">
                  <Video className="w-16 h-16 mx-auto mb-4 text-slate-800" />
                  <p className="text-slate-500 font-black uppercase tracking-[0.2em]">
                    No videos uploaded yet
                  </p>
                </div>
              ) : (
                videosData?.data?.videos?.map((video: VideoType) => (
                  <Link
                    key={video._id}
                    to={`/video/${video._id}`}
                    className="group flex flex-col"
                  >
                    <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg mb-4">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500"></div>
                      <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-black text-white tracking-tighter">
                        {Math.floor(video.duration / 60)}:
                        {String(Math.floor(video.duration % 60)).padStart(
                          2,
                          "0"
                        )}
                      </div>
                    </div>
                    <h3 className="text-white font-black text-sm line-clamp-2 group-hover:text-red-500 transition-colors leading-tight">
                      {video.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.1em]">
                      <span>{video.views} views</span>
                      <span className="w-1 h-1 bg-slate-800 rounded-full"></span>
                      <span>
                        {new Date(video.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}

          {activeTab === "playlists" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {playlistsData?.data?.length === 0 ? (
                <div className="col-span-full py-20 text-center glass rounded-3xl border border-white/5">
                  <List className="w-16 h-16 mx-auto mb-4 text-slate-800" />
                  <p className="text-slate-500 font-black uppercase tracking-[0.2em]">
                    No playlists created
                  </p>
                </div>
              ) : (
                playlistsData?.data?.map((playlist: Playlist) => (
                  <Link
                    key={playlist._id}
                    to={`/playlist/${playlist._id}`}
                    className="group flex flex-col"
                  >
                    <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg mb-4 bg-slate-900">
                      {playlist.videos?.[0]?.thumbnail ? (
                        <img
                          src={playlist.videos[0].thumbnail}
                          alt={playlist.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <List className="w-12 h-12 text-slate-800" />
                        </div>
                      )}
                      <div className="absolute inset-y-0 right-0 w-1/3 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center border-l border-white/5">
                        <span className="text-white font-black text-xl">
                          {playlist.videos?.length || 0}
                        </span>
                        <List className="w-5 h-5 text-white/50 mt-1" />
                      </div>
                    </div>
                    <h3 className="text-white font-black text-sm group-hover:text-red-500 transition-colors uppercase tracking-[0.2em]">
                      {playlist.name}
                    </h3>
                    <p className="text-[10px] font-black text-slate-500 mt-1 uppercase tracking-[0.1em]">
                      Updated{" "}
                      {new Date(playlist.updatedAt).toLocaleDateString()}
                    </p>
                  </Link>
                ))
              )}
            </div>
          )}

          {activeTab === "community" && (
            <div className="max-w-3xl mx-auto space-y-8">
              {tweetsData?.data?.length === 0 ? (
                <div className="py-20 text-center glass rounded-3xl border border-white/5">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 text-slate-800" />
                  <p className="text-slate-500 font-bold uppercase tracking-widest">
                    No community posts yet
                  </p>
                </div>
              ) : (
                tweetsData?.data?.map((tweet: Tweet) => (
                  <div
                    key={tweet._id}
                    className="glass p-8 rounded-3xl border border-white/5 shadow-xl"
                  >
                    <div className="flex items-center space-x-4 mb-6">
                      <img
                        src={channel.avatar}
                        alt={channel.fullName}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-800"
                      />
                      <div>
                        <h4 className="text-white font-black text-sm">
                          {channel.fullName}
                        </h4>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          {new Date(tweet.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-slate-300 text-lg leading-relaxed font-medium mb-8">
                      {tweet.content}
                    </p>
                    <div className="flex items-center gap-6 pt-6 border-t border-white/5">
                      <button
                        onClick={() => likeTweetMutation.mutate(tweet._id)}
                        className={`flex items-center space-x-2.5 px-6 py-2.5 rounded-xl transition-all duration-500 font-black text-[10px] uppercase tracking-widest ${
                          tweet.isLiked
                            ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-900/40"
                            : "bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white"
                        }`}
                      >
                        <ThumbsUp
                          className={`w-4 h-4 ${
                            tweet.isLiked ? "fill-current" : ""
                          }`}
                        />
                        <span>{tweet.likesCount || 0}</span>
                      </button>
                      <button
                        onClick={() => handleToggleComments(tweet._id)}
                        className="flex items-center space-x-2.5 px-6 py-2.5 bg-slate-800/50 text-slate-400 rounded-xl hover:bg-slate-700 hover:text-white transition-all duration-500 font-black text-[10px] uppercase tracking-widest"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Comments</span>
                      </button>
                    </div>

                    {showComments[tweet._id] && (
                      <div className="mt-8 space-y-6 animate-fade-in">
                        {user && (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              if (commentInputs[tweet._id]?.trim()) {
                                addTweetCommentMutation.mutate({
                                  tweetId: tweet._id,
                                  content: commentInputs[tweet._id],
                                });
                              }
                            }}
                            className="flex items-start space-x-4 mb-8"
                          >
                            <img
                              src={user.avatar}
                              alt={user.fullName}
                              className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-800"
                            />
                            <div className="flex-1 relative">
                              <input
                                type="text"
                                value={commentInputs[tweet._id] || ""}
                                onChange={(e) =>
                                  setCommentInputs((prev) => ({
                                    ...prev,
                                    [tweet._id]: e.target.value,
                                  }))
                                }
                                placeholder="Add a premium comment..."
                                className="w-full px-5 py-3 bg-slate-900/50 border border-white/5 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all text-sm font-medium"
                              />
                              <button
                                type="submit"
                                disabled={
                                  !commentInputs[tweet._id]?.trim() ||
                                  addTweetCommentMutation.isPending
                                }
                                className="absolute right-2 top-1.5 bottom-1.5 px-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:from-red-600 hover:to-orange-600 transition-all disabled:opacity-50 font-black text-[10px] uppercase tracking-widest"
                                aria-label="Send comment"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </form>
                        )}

                        <div className="space-y-4">
                          {loadingComments[tweet._id] ? (
                            <div className="flex justify-center py-4">
                              <div className="w-6 h-6 border-2 border-slate-800 border-t-red-600 rounded-full animate-spin"></div>
                            </div>
                          ) : (
                            tweetComments[tweet._id]?.map((comment: Comment) => (
                              <div
                                key={comment._id}
                                className="flex items-start space-x-4 p-4 bg-slate-900/30 rounded-2xl border border-white/5"
                              >
                                <img
                                  src={comment.owner.avatar}
                                  alt={comment.owner.fullName}
                                  className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-800"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className="font-black text-white text-xs">
                                      {comment.owner.fullName}
                                    </span>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">
                                      {new Date(
                                        comment.createdAt
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="text-slate-400 text-sm font-medium">
                                    {comment.content}
                                  </p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Channel;
