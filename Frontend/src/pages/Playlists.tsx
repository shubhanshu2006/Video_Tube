import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { playlistApi } from "../api/playlist";
import { useAuth } from "../hooks/useAuth";
import { Plus, Edit2, Trash2, PlaySquare, X, Eye } from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const Playlists = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<{
    _id: string;
    name: string;
    description: string;
  } | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["userPlaylists", user?._id],
    queryFn: () => playlistApi.getUserPlaylists(user!._id),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      playlistApi.createPlaylist(formData.name, formData.description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userPlaylists"] });
      setShowCreateModal(false);
      setFormData({ name: "", description: "" });
      toast.success("Playlist created successfully");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to create playlist");
    },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      playlistApi.updatePlaylist(
        editingPlaylist!._id,
        formData.name,
        formData.description
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userPlaylists"] });
      setShowEditModal(false);
      setEditingPlaylist(null);
      setFormData({ name: "", description: "" });
      toast.success("Playlist updated successfully");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (playlistId: string) => playlistApi.deletePlaylist(playlistId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userPlaylists"] });
      toast.success("Playlist deleted successfully");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPlaylist) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  const handleEdit = (playlist: {
    _id: string;
    name: string;
    description: string;
  }) => {
    setEditingPlaylist(playlist);
    setFormData({ name: playlist.name, description: playlist.description });
    setShowEditModal(true);
  };

  const playlists = data?.data || [];

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              My Playlists
            </h1>
            <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-[10px]">
              Organize and manage your video collections
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:from-red-600 hover:to-orange-600 transition-all duration-300 shadow-lg shadow-red-900/20 flex items-center justify-center gap-3 group"
          >
            <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Create Playlist
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="glass rounded-3xl p-6 h-64 animate-pulse border border-white/5"
              ></div>
            ))}
          </div>
        ) : playlists.length === 0 ? (
          <div className="text-center py-24 glass rounded-[3rem] border border-white/5">
            <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
              <PlaySquare className="w-10 h-10 text-slate-700" />
            </div>
            <h3 className="text-xl font-black text-white mb-2 tracking-tighter">No playlists yet</h3>
            <p className="text-slate-500 font-medium mb-8">Create your first playlist to organize your videos!</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:from-red-600 hover:to-orange-600 transition-all duration-500 shadow-lg shadow-red-900/20"
            >
              Create Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {playlists.map(
              (playlist: {
                _id: string;
                name: string;
                description: string;
                videos?: Array<{ thumbnail?: string }>;
              }) => (
                <div
                  key={playlist._id}
                  className="glass rounded-[2.5rem] overflow-hidden border border-white/5 group hover:border-red-500/30 transition-all duration-500 shadow-2xl"
                >
                  <div className="relative aspect-video overflow-hidden">
                    {playlist.videos?.[0]?.thumbnail ? (
                      <img
                        src={playlist.videos[0].thumbnail}
                        alt={playlist.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                        <PlaySquare className="w-16 h-16 text-slate-800" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                    <div className="absolute bottom-4 right-4 glass px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white border border-white/10">
                      {playlist.videos?.length || 0} videos
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="text-xl font-black text-white mb-2 line-clamp-1 group-hover:text-red-400 transition-colors tracking-tight">
                      {playlist.name}
                    </h3>
                    <p className="text-slate-400 text-sm font-medium line-clamp-2 mb-8 h-10 leading-relaxed">
                      {playlist.description}
                    </p>
                    <div className="flex gap-3">
                      <Link
                        to={`/playlist/${playlist._id}`}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-900/20 hover:from-red-600 hover:to-orange-600"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Link>
                      <button
                        onClick={() => handleEdit(playlist)}
                        className="p-3 glass text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all border border-white/5"
                        title="Edit Playlist"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(playlist._id)}
                        className="p-3 glass text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all border border-white/5"
                        title="Delete Playlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}

        
        {(showCreateModal || showEditModal) && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="glass rounded-[2.5rem] p-10 max-w-md w-full border border-white/10 shadow-2xl animate-scale-in relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 blur-[80px] -mr-32 -mt-32"></div>
              
              <div className="flex justify-between items-center mb-8 relative z-10">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    {showEditModal ? "Edit Playlist" : "Create Playlist"}
                  </h2>
                  <p className="text-slate-500 font-bold mt-1 uppercase tracking-widest text-[10px]">
                    {showEditModal ? "Update your collection details" : "Start a new video collection"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setEditingPlaylist(null);
                    setFormData({ name: "", description: "" });
                  }}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-white"
                  aria-label="Close dialog"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                    Playlist Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:bg-white/10 transition-all font-medium"
                    placeholder="Enter a catchy name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                    Description
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={4}
                    className="w-full px-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:bg-white/10 transition-all font-medium resize-none"
                    placeholder="What's this playlist about?"
                  />
                </div>

                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="w-full py-5 px-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:from-red-600 hover:to-orange-600 transition-all duration-300 shadow-xl shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                  {createMutation.isPending || updateMutation.isPending 
                    ? "Processing..." 
                    : showEditModal ? "Update Playlist" : "Create Playlist"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Playlists;
