import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tweetApi } from "../api/tweet";
import { likeApi } from "../api/like";
import { useAuth } from "../hooks/useAuth";
import { MessageSquare, Heart, Trash2, Edit2, Send, Share2, MessageCircle } from "lucide-react";
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-4 border-red-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-red-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-600/10 rounded-full border border-red-500/20">
              <MessageCircle className="w-3.5 h-3.5 text-red-500" />
              <span className="text-[9px] font-black text-red-500 uppercase tracking-[0.2em]">Community</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Tweets
            </h1>
            <p className="text-slate-500 font-medium text-xs max-w-md">
              Share your thoughts, updates, and connect with your audience through short posts.
            </p>
          </div>
        </div>

        {/* Create Tweet */}
        <div className="glass rounded-2xl p-6 mb-8 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-[80px] -mr-32 -mt-32"></div>
          <div className="flex gap-4 relative z-10">
            <img
              src={user?.avatar}
              alt={user?.fullName}
              className="w-12 h-12 rounded-xl object-cover ring-2 ring-white/5"
            />
            <div className="flex-1 space-y-4">
              <textarea
                value={newTweet}
                onChange={(e) => setNewTweet(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full bg-slate-900/50 border border-white/5 rounded-[2rem] p-6 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all resize-none min-h-[120px]"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleCreateTweet}
                  disabled={!newTweet.trim() || createMutation.isPending}
                  className="px-10 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:from-red-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-red-500/20 flex items-center gap-3"
                >
                  {createMutation.isPending ? "Posting..." : "Post Tweet"}
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tweets List */}
        <div className="space-y-6">
          {tweets.length === 0 ? (
            <div className="text-center py-32 glass rounded-[3rem] border border-white/5">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8">
                <MessageSquare className="w-12 h-12 text-slate-700" />
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight mb-2">No posts yet</h3>
              <p className="text-slate-500 text-sm">Be the first to share something with the community!</p>
            </div>
          ) : (
            tweets.map((tweet) => (
              <div
                key={tweet._id}
                className="glass rounded-[2.5rem] p-8 border border-white/5 hover:border-red-500/30 transition-all duration-500 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/5 blur-[60px] -mr-24 -mt-24 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="flex gap-6 relative z-10">
                  <img
                    src={tweet.owner.avatar}
                    alt={tweet.owner.fullName}
                    className="w-14 h-14 rounded-2xl object-cover ring-4 ring-white/5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-black text-white tracking-tight leading-none mb-1">
                          {tweet.owner.fullName}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-red-500 font-black text-[10px] uppercase tracking-widest">@{tweet.owner.username}</span>
                          <span className="text-slate-600 text-[10px] font-black">•</span>
                          <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{formatDate(tweet.createdAt)}</span>
                        </div>
                      </div>
                      
                      {user?._id === tweet.owner._id && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingTweetId(tweet._id);
                              setEditContent(tweet.content);
                            }}
                            className="p-2.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                            aria-label="Edit post"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm("Delete this post?")) {
                                deleteMutation.mutate(tweet._id);
                              }
                            }}
                            className="p-2.5 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"                            aria-label="Delete post"                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {editingTweetId === tweet._id ? (
                      <div className="space-y-4">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full bg-slate-900/50 border border-red-500/30 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all resize-none"
                          rows={3}
                          placeholder="Edit your post..."
                          aria-label="Edit post content"
                        />
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => setEditingTweetId(null)}
                            className="px-6 py-2.5 bg-white/5 text-slate-400 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() =>
                              updateMutation.mutate({
                                tweetId: tweet._id,
                                content: editContent,
                              })
                            }
                            disabled={!editContent.trim() || updateMutation.isPending}
                            className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:from-red-600 hover:to-orange-600 transition-all shadow-lg shadow-red-500/20"
                          >
                            Save Changes
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-300 text-base leading-relaxed mb-6 whitespace-pre-wrap">
                        {tweet.content}
                      </p>
                    )}

                    <div className="flex items-center gap-8 pt-4 border-t border-white/5">
                      <button
                        onClick={() => toggleLikeMutation.mutate(tweet._id)}
                        className="flex items-center gap-2.5 group/like"
                      >
                        <div className="p-2 rounded-xl bg-white/5 group-hover/like:bg-red-500/10 transition-all">
                          <Heart className={`w-4 h-4 transition-all ${tweet.likesCount ? "fill-red-500 text-red-500" : "text-slate-500 group-hover/like:text-red-500"}`} />
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${tweet.likesCount ? "text-red-500" : "text-slate-500 group-hover/like:text-red-500"}`}>
                          {tweet.likesCount || 0} Likes
                        </span>
                      </button>
                      
                      <button className="flex items-center gap-2.5 group/share">
                        <div className="p-2 rounded-xl bg-white/5 group-hover/share:bg-blue-500/10 transition-all">
                          <Share2 className="w-4 h-4 text-slate-500 group-hover/share:text-blue-500" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover/share:text-blue-500">
                          Share
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityPosts;
