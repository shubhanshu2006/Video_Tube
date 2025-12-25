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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            My Playlists
          </h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:from-red-600 hover:to-orange-600 transition-all duration-300 flex items-center shadow-lg hover:shadow-red-500/30 transform hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Playlist
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-gray-800 rounded-xl p-6 h-48"
              ></div>
            ))}
          </div>
        ) : playlists.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <PlaySquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-xl">No playlists yet</p>
            <p className="text-sm mt-2">
              Create your first playlist to organize your videos!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {playlists.map(
              (playlist: {
                _id: string;
                name: string;
                description: string;
                videos?: Array<{ thumbnail?: string }>;
              }) => (
                <div
                  key={playlist._id}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50 shadow-xl hover:shadow-2xl hover:shadow-red-500/20 transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 group"
                >
                  <div className="relative h-48 bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                    {playlist.videos?.[0]?.thumbnail ? (
                      <img
                        src={playlist.videos[0].thumbnail}
                        alt={playlist.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <PlaySquare className="w-16 h-16 text-white opacity-50" />
                    )}
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 px-2 py-1 rounded text-xs">
                      {playlist.videos?.length || 0} videos
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-semibold mb-2">
                      {playlist.name}
                    </h3>
                    <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                      {playlist.description}
                    </p>
                    <div className="flex space-x-2">
                      <Link
                        to={`/playlist/${playlist._id}`}
                        className="flex-1 px-3 py-2 bg-red-500 rounded hover:bg-red-600 transition-colors flex items-center justify-center"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Link>
                      <button
                        onClick={() => handleEdit(playlist)}
                        className="px-3 py-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors flex items-center justify-center"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(playlist._id)}
                        className="px-3 py-2 bg-red-600 rounded hover:bg-red-700 transition-colors"
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

        {showCreateModal && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800/95 backdrop-blur-md rounded-2xl p-8 max-w-md w-full border border-gray-700/50 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Create Playlist
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Playlist name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Describe your playlist"
                  />
                </div>

                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="w-full py-3 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createMutation.isPending ? "Creating..." : "Create Playlist"}
                </button>
              </form>
            </div>
          </div>
        )}

        {showEditModal && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800/95 backdrop-blur-md rounded-2xl p-8 max-w-md w-full border border-gray-700/50 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Edit Playlist
                </h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingPlaylist(null);
                    setFormData({ name: "", description: "" });
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Playlist name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Describe your playlist"
                  />
                </div>

                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="w-full py-3 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateMutation.isPending ? "Updating..." : "Update Playlist"}
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
