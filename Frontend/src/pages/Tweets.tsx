import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tweetApi } from "../api/tweet";
import { likeApi } from "../api/like";
import { useAuth } from "../hooks/useAuth";
import { MessageSquare, Heart, Trash2, Edit2, Send, X } from "lucide-react";
import toast from "react-hot-toast";

interface Tweet {
  _id: string;
  content: string;
  owner: {
    _id: string;
    username: string;
    fullName: string;
    avatar: string;
  };
  likesCount?: number;
  createdAt: string;
}

const formatDate = (date: string) => {
  const now = new Date();
  const tweetDate = new Date(date);
  const diffInMs = now.getTime() - tweetDate.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSeconds < 60) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return tweetDate.toLocaleDateString();
};

const CommunityPosts = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newTweet, setNewTweet] = useState("");
  const [editingTweetId, setEditingTweetId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["userTweets", user?._id],
    queryFn: () =>
      user?._id ? tweetApi.getUserTweets(user._id) : Promise.resolve(null),
    enabled: !!user?._id,
  });

  const createMutation = useMutation({
    mutationFn: tweetApi.createTweet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userTweets"] });
      setNewTweet("");
      toast.success("Post published successfully!");
    },
    onError: () => {
      toast.error("Failed to publish post");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ tweetId, content }: { tweetId: string; content: string }) =>
      tweetApi.updateTweet(tweetId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userTweets"] });
      setEditingTweetId(null);
      setEditContent("");
      toast.success("Post updated successfully!");
    },
    onError: () => {
      toast.error("Failed to update post");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: tweetApi.deleteTweet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userTweets"] });
      toast.success("Post deleted successfully!");
    },
    onError: () => {
      toast.error("Failed to delete post");
    },
  });

  const toggleLikeMutation = useMutation({
    mutationFn: likeApi.toggleTweetLike,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userTweets"] });
    },
  });

  const tweets: Tweet[] = data?.data || [];

  const handleCreateTweet = () => {
    if (newTweet.trim()) {
      createMutation.mutate(newTweet.trim());
    }
  };

  const handleUpdateTweet = (tweetId: string) => {
    if (editContent.trim()) {
      updateMutation.mutate({ tweetId, content: editContent.trim() });
    }
  };

  const handleDeleteTweet = (tweetId: string) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      deleteMutation.mutate(tweetId);
    }
  };

  const startEditing = (tweet: Tweet) => {
    setEditingTweetId(tweet._id);
    setEditContent(tweet.content);
  };

  const cancelEditing = () => {
    setEditingTweetId(null);
    setEditContent("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Community Posts
        </h1>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-gray-700/50 shadow-xl">
          <div className="flex items-start space-x-4">
            <img
              src={user?.avatar || "/default-avatar.png"}
              alt={user?.fullName}
              className="w-12 h-12 rounded-full ring-2 ring-red-500/20"
            />
            <div className="flex-1">
              <textarea
                value={newTweet}
                onChange={(e) => setNewTweet(e.target.value)}
                placeholder="Share your thoughts..."
                maxLength={280}
                className="w-full bg-gray-700 text-white rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={3}
              />
              <div className="flex justify-between items-center mt-3">
                <span className="text-sm text-gray-400">
                  {newTweet.length}/280
                </span>
                <button
                  onClick={handleCreateTweet}
                  disabled={!newTweet.trim() || createMutation.isPending}
                  className="px-6 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full hover:from-red-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold flex items-center shadow-lg hover:shadow-red-500/30 transform hover:-translate-y-0.5"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Tweet
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tweets List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-xl p-6 animate-pulse">
                <div className="flex space-x-4">
                  <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : tweets.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-xl">No posts yet</p>
            <p className="text-sm mt-2">
              Share your thoughts with the community!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tweets.map((tweet) => (
              <div
                key={tweet._id}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl hover:shadow-2xl hover:border-gray-600/50 transition-all duration-300"
              >
                <div className="flex items-start space-x-4">
                  <img
                    src={tweet.owner.avatar}
                    alt={tweet.owner.fullName}
                    className="w-12 h-12 rounded-full ring-2 ring-red-500/20"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-white font-semibold">
                          {tweet.owner.fullName}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          @{tweet.owner.username} ·{" "}
                          {formatDate(tweet.createdAt)}
                        </p>
                      </div>
                      {user?._id === tweet.owner._id && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => startEditing(tweet)}
                            className="text-gray-400 hover:text-blue-400 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTweet(tweet._id)}
                            className="text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {editingTweetId === tweet._id ? (
                      <div className="mt-3">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          maxLength={280}
                          className="w-full bg-gray-700 text-white rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
                          rows={3}
                        />
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-gray-400">
                            {editContent.length}/280
                          </span>
                          <div className="flex space-x-2">
                            <button
                              onClick={cancelEditing}
                              className="px-4 py-2 bg-gray-600 text-white rounded-full hover:bg-gray-500 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleUpdateTweet(tweet._id)}
                              disabled={!editContent.trim()}
                              className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-white whitespace-pre-wrap">
                        {tweet.content}
                      </p>
                    )}

                    <div className="flex items-center space-x-6 mt-4 text-gray-400">
                      <button
                        onClick={() => toggleLikeMutation.mutate(tweet._id)}
                        className="flex items-center space-x-2 hover:text-red-400 transition-colors"
                      >
                        <Heart className="w-5 h-5" />
                        <span>{tweet.likesCount || 0}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityPosts;
