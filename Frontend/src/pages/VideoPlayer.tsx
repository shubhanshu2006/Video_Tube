import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { videoApi } from "../api/video";
import { commentApi } from "../api/comment";
import { likeApi } from "../api/like";
import { subscriptionApi } from "../api/subscription";
import { playlistApi } from "../api/playlist";
import { useAuth } from "../hooks/useAuth";
import { useState, useRef, useEffect } from "react";
import {
  ThumbsUp,
  Share2,
  Eye,
  Clock,
  Send,
  ListPlus,
  Edit2,
  Trash2,
  X,
  Check,
} from "lucide-react";
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

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const VideoPlayer = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState("");
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasRecordedView = useRef(false);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        !target.closest(".playlist-menu") &&
        !target.closest(".playlist-button")
      ) {
        setShowPlaylistMenu(false);
      }
      if (!target.closest(".share-menu") && !target.closest(".share-button")) {
        setShowShareMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data: videoData, isLoading: videoLoading } = useQuery({
    queryKey: ["video", videoId],
    queryFn: () => videoApi.getVideoById(videoId!),
    enabled: !!videoId,
  });

  const { data: commentsData } = useQuery({
    queryKey: ["comments", videoId],
    queryFn: () => commentApi.getVideoComments(videoId!),
    enabled: !!videoId,
  });

  const { data: playlistsData } = useQuery({
    queryKey: ["user-playlists", user?._id],
    queryFn: () => playlistApi.getUserPlaylists(user!._id),
    enabled: !!user,
  });

  // Fetch related videos (all videos excluding current)
  const { data: relatedVideosData } = useQuery({
    queryKey: ["related-videos", videoId],
    queryFn: () => videoApi.getAllVideos({ page: 1, limit: 10 }),
    enabled: !!videoId,
  });

  const likeMutation = useMutation({
    mutationFn: () => likeApi.toggleVideoLike(videoId!),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["video", videoId] });
      toast.success(data.data.isLiked ? "Liked" : "Unliked");
    },
  });

  const subscribeMutation = useMutation({
    mutationFn: (channelId: string) =>
      subscriptionApi.toggleSubscription(channelId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["video", videoId] });
      toast.success(data.data.subscribed ? "Subscribed" : "Unsubscribed");
    },
  });

  const addToPlaylistMutation = useMutation({
    mutationFn: ({
      playlistId,
      videoId,
    }: {
      playlistId: string;
      videoId: string;
    }) => playlistApi.addVideoToPlaylist(playlistId, videoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-playlists"] });
      queryClient.invalidateQueries({ queryKey: ["userPlaylists"] });
      toast.success("Added to playlist");
      setShowPlaylistMenu(false);
    },
    onError: () => {
      toast.error("Failed to add to playlist");
    },
  });

  const commentMutation = useMutation({
    mutationFn: (content: string) => commentApi.addComment(videoId!, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", videoId] });
      setCommentText("");
      toast.success("Comment added");
    },
  });

  const likeCommentMutation = useMutation({
    mutationFn: (commentId: string) => likeApi.toggleCommentLike(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", videoId] });
    },
  });

  const updateCommentMutation = useMutation({
    mutationFn: ({
      commentId,
      content,
    }: {
      commentId: string;
      content: string;
    }) => commentApi.updateComment(commentId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", videoId] });
      setEditingCommentId(null);
      setEditingCommentContent("");
      toast.success("Comment updated");
    },
    onError: () => {
      toast.error("Failed to update comment");
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => commentApi.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", videoId] });
      toast.success("Comment deleted");
    },
    onError: () => {
      toast.error("Failed to delete comment");
    },
  });

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      commentMutation.mutate(commentText);
    }
  };

  const handleEditComment = (commentId: string, content: string) => {
    setEditingCommentId(commentId);
    setEditingCommentContent(content);
  };

  const handleSaveEdit = (commentId: string) => {
    if (editingCommentContent.trim()) {
      updateCommentMutation.mutate({
        commentId,
        content: editingCommentContent,
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingCommentContent("");
  };

  const handleDeleteComment = (commentId: string) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      deleteCommentMutation.mutate(commentId);
    }
  };

  const handleShare = () => {
    setShowShareMenu(!showShareMenu);
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Link copied to clipboard");
      setShowShareMenu(false);
    });
  };

  const handleShareTo = (platform: string) => {
    const url = window.location.href;
    const text = video?.title || "Check out this video";

    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        url
      )}&text=${encodeURIComponent(text)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        url
      )}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(
        url
      )}&text=${encodeURIComponent(text)}`,
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], "_blank", "width=600,height=400");
      setShowShareMenu(false);
    }
  };

  const handleAddToPlaylist = (playlistId: string) => {
    if (videoId) {
      addToPlaylistMutation.mutate({ playlistId, videoId });
    }
  };

  const handleVideoProgress = () => {
    if (!videoRef.current || hasRecordedView.current || !videoId) return;

    const currentTime = videoRef.current.currentTime;
    const duration = videoRef.current.duration;

    if (duration > 0 && currentTime / duration >= 0.5) {
      hasRecordedView.current = true;
      videoApi.recordView(videoId).then(() => {
        queryClient.invalidateQueries({ queryKey: ["video", videoId] });
      });
    }
  };

  const video = videoData?.data;
  const comments = commentsData?.data?.docs || [];
  const playlists = playlistsData?.data || [];
  const allVideos = relatedVideosData?.data?.videos || [];
  const relatedVideos = allVideos
    .filter((v: { _id: string }) => v._id !== videoId)
    .slice(0, 8);

  if (videoLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-gray-400">Video not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-gray-700/50">
              <video
                ref={videoRef}
                src={video.videoFile}
                controls
                className="w-full aspect-video"
                poster={video.thumbnail}
                onTimeUpdate={handleVideoProgress}
              />
            </div>

            <div className="mt-6 p-6 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 shadow-xl">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {video.title}
              </h1>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center text-gray-400 text-sm">
                  <Eye className="w-4 h-4 mr-2" />
                  <span>{formatViews(video.views)} views</span>
                  <span className="mx-2">•</span>
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{formatDate(video.createdAt)}</span>
                </div>

                <div className="flex items-center space-x-4">
                  {user && (
                    <button
                      onClick={() => likeMutation.mutate()}
                      disabled={likeMutation.isPending}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 shadow-lg transform hover:-translate-y-0.5 ${
                        video.isLiked
                          ? "bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600 hover:shadow-red-500/30"
                          : "bg-gray-800 text-white hover:bg-gray-700 hover:shadow-gray-500/30"
                      }`}
                    >
                      <ThumbsUp
                        className={`w-5 h-5 ${
                          video.isLiked ? "fill-current" : ""
                        }`}
                      />
                      <span>{video.likesCount || 0}</span>
                    </button>
                  )}

                  {!user && (
                    <div className="flex items-center space-x-2 px-4 py-2 bg-gray-800 rounded-full">
                      <ThumbsUp className="w-5 h-5" />
                      <span>{video.likesCount || 0}</span>
                    </div>
                  )}

                  <div className="relative">
                    <button
                      onClick={handleShare}
                      className="share-button flex items-center space-x-2 px-4 py-2 bg-gray-800 rounded-full hover:bg-gray-700 hover:shadow-lg hover:shadow-gray-500/30 transition-all duration-300 transform hover:-translate-y-0.5"
                    >
                      <Share2 className="w-5 h-5" />
                      <span>Share</span>
                    </button>

                    {showShareMenu && (
                      <div className="share-menu absolute right-0 mt-2 w-56 bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-700/50 z-10 overflow-hidden">
                        <div className="p-2">
                          <button
                            onClick={handleCopyLink}
                            className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-red-500 hover:to-orange-500 rounded-xl text-white transition-all duration-200 font-medium"
                          >
                            Copy link
                          </button>
                          <button
                            onClick={() => handleShareTo("twitter")}
                            className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-red-500 hover:to-orange-500 rounded-xl text-white transition-all duration-200 font-medium"
                          >
                            Share on Twitter
                          </button>
                          <button
                            onClick={() => handleShareTo("facebook")}
                            className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-red-500 hover:to-orange-500 rounded-xl text-white transition-all duration-200 font-medium"
                          >
                            Share on Facebook
                          </button>
                          <button
                            onClick={() => handleShareTo("whatsapp")}
                            className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-red-500 hover:to-orange-500 rounded-xl text-white transition-all duration-200 font-medium"
                          >
                            Share on WhatsApp
                          </button>
                          <button
                            onClick={() => handleShareTo("telegram")}
                            className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-red-500 hover:to-orange-500 rounded-xl text-white transition-all duration-200 font-medium"
                          >
                            Share on Telegram
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {user && (
                    <div className="relative">
                      <button
                        onClick={() => setShowPlaylistMenu(!showPlaylistMenu)}
                        className="playlist-button flex items-center space-x-2 px-4 py-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
                      >
                        <ListPlus className="w-5 h-5" />
                        <span>Save</span>
                      </button>

                      {showPlaylistMenu && (
                        <div className="playlist-menu absolute right-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                          <div className="p-2">
                            {playlists.length === 0 ? (
                              <p className="text-gray-400 text-sm p-2">
                                No playlists found
                              </p>
                            ) : (
                              playlists.map((playlist) => {
                                const isVideoInPlaylist = playlist.videos?.some(
                                  (v) => v._id === videoId
                                );
                                return (
                                  <button
                                    key={playlist._id}
                                    onClick={() =>
                                      !isVideoInPlaylist &&
                                      handleAddToPlaylist(playlist._id)
                                    }
                                    className={`w-full text-left px-3 py-2 rounded flex items-center justify-between ${
                                      isVideoInPlaylist
                                        ? "bg-gray-700 cursor-default"
                                        : "hover:bg-gray-700"
                                    }`}
                                    disabled={isVideoInPlaylist}
                                  >
                                    <span className="text-white">
                                      {playlist.name}
                                    </span>
                                    {isVideoInPlaylist && (
                                      <span className="text-xs text-green-500">
                                        Added
                                      </span>
                                    )}
                                  </button>
                                );
                              })
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {video.owner && (
                <div className="flex items-center justify-between mt-6 p-4 bg-gray-800 rounded-xl">
                  <Link
                    to={`/channel/${video.owner.username}`}
                    className="flex items-center flex-1 hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    <img
                      src={video.owner.avatar}
                      alt={video.owner.fullName}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <h3 className="font-semibold text-white hover:text-red-400 transition-colors">
                        {video.owner.fullName}
                      </h3>
                      <p className="text-sm text-gray-400">
                        @{video.owner.username}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatViews(video.subscribersCount || 0)} subscribers
                      </p>
                    </div>
                  </Link>
                  {user && video.owner && user._id !== video.owner._id && (
                    <button
                      onClick={() => subscribeMutation.mutate(video.owner!._id)}
                      disabled={subscribeMutation.isPending}
                      className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 shadow-lg transform hover:-translate-y-0.5 ${
                        video.isSubscribed
                          ? "bg-gray-700 text-white hover:bg-gray-600 hover:shadow-gray-500/30"
                          : "bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600 hover:shadow-red-500/30"
                      }`}
                    >
                      {video.isSubscribed ? "Subscribed" : "Subscribe"}
                    </button>
                  )}
                </div>
              )}

              <div className="mt-6 p-4 bg-gray-800 rounded-xl">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-300 whitespace-pre-wrap">
                  {video.description}
                </p>
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">
                  Comments ({comments.length})
                </h3>

                {user && (
                  <form
                    onSubmit={handleComment}
                    className="flex items-start space-x-4 mb-6"
                  >
                    <img
                      src={user.avatar}
                      alt={user.fullName}
                      className="w-10 h-10 rounded-full ring-2 ring-red-500/20"
                    />
                    <div className="flex-1">
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add a comment..."
                        aria-label="Add a comment"
                        className="w-full px-4 py-3 bg-gray-800/50 backdrop-blur-sm border-2 border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      />
                      <div className="flex justify-end mt-2">
                        <button
                          type="submit"
                          disabled={
                            !commentText.trim() || commentMutation.isPending
                          }
                          className="px-6 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:from-red-600 hover:to-orange-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-xl hover:shadow-red-500/50 transform hover:-translate-y-1 font-semibold"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Comment
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                <div className="space-y-4">
                  {comments.map(
                    (comment: {
                      _id: string;
                      content: string;
                      createdAt: string;
                      owner: { _id: string; avatar: string; fullName: string };
                      likesCount?: number;
                    }) => (
                      <div
                        key={comment._id}
                        className="flex items-start space-x-4 p-4 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/30 hover:border-gray-600/50 hover:bg-gray-800/50 transition-all duration-300"
                      >
                        <img
                          src={comment.owner.avatar}
                          alt={comment.owner.fullName}
                          className="w-10 h-10 rounded-full ring-2 ring-red-500/20"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold">
                                {comment.owner.fullName}
                              </span>
                              <span className="text-sm text-gray-400">
                                {formatDate(comment.createdAt)}
                              </span>
                            </div>
                            {user && user._id === comment.owner._id && (
                              <div className="flex items-center space-x-2">
                                {editingCommentId !== comment._id && (
                                  <>
                                    <button
                                      onClick={() =>
                                        handleEditComment(
                                          comment._id,
                                          comment.content
                                        )
                                      }
                                      className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                                      title="Edit comment"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteComment(comment._id)
                                      }
                                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                      title="Delete comment"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                          {editingCommentId === comment._id ? (
                            <div className="mt-2">
                              <input
                                type="text"
                                value={editingCommentContent}
                                onChange={(e) =>
                                  setEditingCommentContent(e.target.value)
                                }
                                aria-label="Edit comment"
                                className="w-full px-4 py-3 bg-gray-800/50 backdrop-blur-sm border-2 border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                autoFocus
                              />
                              <div className="flex items-center space-x-2 mt-2">
                                <button
                                  onClick={() => handleSaveEdit(comment._id)}
                                  disabled={
                                    !editingCommentContent.trim() ||
                                    updateCommentMutation.isPending
                                  }
                                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm font-semibold shadow-lg hover:shadow-green-500/30"
                                >
                                  <Check className="w-4 h-4 mr-1" />
                                  Save
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="px-4 py-2 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-all duration-300 flex items-center text-sm font-semibold"
                                >
                                  <X className="w-4 h-4 mr-1" />
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className="mt-1 text-gray-300">
                                {comment.content}
                              </p>
                              {user && (
                                <button
                                  onClick={() =>
                                    likeCommentMutation.mutate(comment._id)
                                  }
                                  className="mt-2 flex items-center space-x-1 text-sm text-gray-400 hover:text-red-400 transition-colors"
                                >
                                  <ThumbsUp className="w-4 h-4" />
                                  <span>{comment.likesCount || 0}</span>
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Related Videos
            </h3>
            <div className="space-y-4">
              {relatedVideos.length === 0 ? (
                <p className="text-gray-400 text-sm">No related videos found</p>
              ) : (
                relatedVideos.map(
                  (relatedVideo: {
                    _id: string;
                    title: string;
                    thumbnail: string;
                    duration: number;
                    views: number;
                    owner?: { fullName: string };
                    createdAt: string;
                  }) => (
                    <Link
                      key={relatedVideo._id}
                      to={`/video/${relatedVideo._id}`}
                      className="flex space-x-3 p-2 rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 hover:bg-gray-800/60 hover:border-gray-600/50 hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <div className="relative flex-shrink-0">
                        <img
                          src={relatedVideo.thumbnail}
                          alt={relatedVideo.title}
                          className="w-40 h-24 object-cover rounded-xl"
                        />
                        <div className="absolute bottom-1 right-1 bg-black/90 backdrop-blur-sm px-2 py-0.5 rounded-lg text-xs text-white flex items-center font-semibold">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDuration(relatedVideo.duration)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-white line-clamp-2 mb-1 group-hover:text-red-400 transition-colors">
                          {relatedVideo.title}
                        </h4>
                        <p className="text-xs text-gray-400">
                          {relatedVideo.owner?.fullName || "Unknown"}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-gray-400 mt-1">
                          <span className="flex items-center">
                            <Eye className="w-3 h-3 mr-1" />
                            {formatViews(relatedVideo.views)}
                          </span>
                          <span>•</span>
                          <span>{formatDate(relatedVideo.createdAt)}</span>
                        </div>
                      </div>
                    </Link>
                  )
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
