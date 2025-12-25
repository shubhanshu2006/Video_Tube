import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { authApi } from "../api/auth";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Upload,
  Loader2,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";

const Settings = () => {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"profile" | "password" | "danger">(
    "profile"
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const updateProfileMutation = useMutation({
    mutationFn: () =>
      authApi.updateAccount(profileData.fullName, profileData.email),
    onSuccess: () => {
      refreshUser();
      toast.success("Profile updated successfully");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to update profile");
    },
  });

  const updateAvatarMutation = useMutation({
    mutationFn: (file: File) => authApi.updateAvatar(file),
    onSuccess: () => {
      refreshUser();
      toast.success("Avatar updated successfully");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to update avatar");
    },
  });

  const updateCoverMutation = useMutation({
    mutationFn: (file: File) => authApi.updateCoverImage(file),
    onSuccess: () => {
      refreshUser();
      toast.success("Cover image updated successfully");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err.response?.data?.message || "Failed to update cover image"
      );
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: () =>
      authApi.changePassword(
        passwordData.oldPassword,
        passwordData.newPassword
      ),
    onSuccess: () => {
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.success("Password changed successfully");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to change password");
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: () => authApi.deleteAccount(),
    onSuccess: () => {
      toast.success("Account deleted successfully");
      logout();
      navigate("/login");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to delete account");
    },
  });

  const handleDeleteAccount = () => {
    if (
      window.confirm(
        "Are you absolutely sure? This action cannot be undone. All your videos, comments, likes, and playlists will be permanently deleted."
      )
    ) {
      deleteAccountMutation.mutate();
    }
    setShowDeleteConfirm(false);
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate();
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    changePasswordMutation.mutate();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateAvatarMutation.mutate(file);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateCoverMutation.mutate(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Settings
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 space-y-2 border border-gray-700/50 shadow-xl">
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center space-x-3 ${
                  activeTab === "profile"
                    ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/40 transform scale-105"
                    : "text-gray-400 hover:bg-gray-700/50 hover:text-white"
                }`}
              >
                <User className="w-5 h-5" />
                <span>Profile</span>
              </button>
              <button
                onClick={() => setActiveTab("password")}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center space-x-3 ${
                  activeTab === "password"
                    ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/40 transform scale-105"
                    : "text-gray-400 hover:bg-gray-700/50 hover:text-white"
                }`}
              >
                <Lock className="w-5 h-5" />
                <span>Password</span>
              </button>
              <button
                onClick={() => setActiveTab("danger")}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center space-x-3 ${
                  activeTab === "danger"
                    ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/40 transform scale-105"
                    : "text-gray-400 hover:bg-gray-700/50 hover:text-white"
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
                <span>Danger Zone</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 shadow-xl">
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-4">
                      Profile Picture
                    </label>
                    <div className="flex items-center space-x-4">
                      <img
                        src={user?.avatar}
                        alt={user?.fullName}
                        className="w-24 h-24 rounded-full object-cover ring-4 ring-red-500/30 shadow-xl hover:ring-red-500/50 transition-all"
                      />
                      <label className="cursor-pointer px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-600 text-white rounded-xl hover:from-red-500 hover:to-orange-500 transition-all duration-300 flex items-center shadow-lg hover:shadow-red-500/30 transform hover:-translate-y-0.5 font-semibold">
                        <Upload className="w-4 h-4 mr-2" />
                        {updateAvatarMutation.isPending
                          ? "Uploading..."
                          : "Change Avatar"}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                          disabled={updateAvatarMutation.isPending}
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-4">
                      Cover Image
                    </label>
                    <div className="space-y-4">
                      {user?.coverImage && (
                        <img
                          src={user.coverImage}
                          alt="Cover"
                          className="w-full h-48 object-cover rounded-2xl border-2 border-gray-700/50 shadow-xl hover:border-red-500/30 transition-all"
                        />
                      )}
                      <label className="cursor-pointer px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-600 text-white rounded-xl hover:from-red-500 hover:to-orange-500 transition-all duration-300 inline-flex items-center shadow-lg hover:shadow-red-500/30 transform hover:-translate-y-0.5 font-semibold">
                        <Upload className="w-4 h-4 mr-2" />
                        {updateCoverMutation.isPending
                          ? "Uploading..."
                          : "Change Cover"}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverChange}
                          className="hidden"
                          disabled={updateCoverMutation.isPending}
                        />
                      </label>
                    </div>
                  </div>

                  <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={profileData.fullName}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              fullName: e.target.value,
                            })
                          }
                          className="w-full pl-10 pr-4 py-3 bg-gray-700/50 backdrop-blur-sm border-2 border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              email: e.target.value,
                            })
                          }
                          className="w-full pl-10 pr-4 py-3 bg-gray-700/50 backdrop-blur-sm border-2 border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      className="w-full py-3 px-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:from-red-600 hover:to-orange-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-xl hover:shadow-red-500/50 transform hover:-translate-y-1 font-bold text-lg"
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <Loader2 className="animate-spin mr-2 h-5 w-5" />
                          Updating...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === "password" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold mb-6">Change Password</h2>

                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="password"
                          value={passwordData.oldPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              oldPassword: e.target.value,
                            })
                          }
                          className="w-full pl-10 pr-4 py-3 bg-gray-700/50 backdrop-blur-sm border-2 border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              newPassword: e.target.value,
                            })
                          }
                          className="w-full pl-10 pr-4 py-3 bg-gray-700/50 backdrop-blur-sm border-2 border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              confirmPassword: e.target.value,
                            })
                          }
                          className="w-full pl-10 pr-4 py-3 bg-gray-700/50 backdrop-blur-sm border-2 border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={changePasswordMutation.isPending}
                      className="w-full py-3 px-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:from-red-600 hover:to-orange-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-xl hover:shadow-red-500/50 transform hover:-translate-y-1 font-bold text-lg"
                    >
                      {changePasswordMutation.isPending ? (
                        <>
                          <Loader2 className="animate-spin mr-2 h-5 w-5" />
                          Changing...
                        </>
                      ) : (
                        "Change Password"
                      )}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === "danger" && (
                <div className="bg-gray-800 rounded-xl p-6">
                  <div className="flex items-center mb-6">
                    <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
                    <h2 className="text-xl font-semibold text-red-500">
                      Danger Zone
                    </h2>
                  </div>

                  <div className="bg-red-900 bg-opacity-20 border border-red-500 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-red-400 mb-2">
                      Delete Account
                    </h3>
                    <p className="text-gray-300 mb-4">
                      Once you delete your account, there is no going back. This
                      will permanently delete:
                    </p>
                    <ul className="list-disc list-inside text-gray-400 mb-6 space-y-1">
                      <li>All your videos and thumbnails</li>
                      <li>All your comments</li>
                      <li>All your likes and playlists</li>
                      <li>All your tweets</li>
                      <li>All your subscriptions</li>
                      <li>Your profile and account data</li>
                    </ul>

                    {!showDeleteConfirm ? (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                      >
                        <Trash2 className="w-5 h-5 mr-2" />
                        Delete My Account
                      </button>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-yellow-400 font-semibold flex items-center">
                          <AlertTriangle className="w-5 h-5 mr-2" />
                          Are you absolutely sure?
                        </p>
                        <div className="flex space-x-4">
                          <button
                            onClick={handleDeleteAccount}
                            disabled={deleteAccountMutation.isPending}
                            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
                          >
                            {deleteAccountMutation.isPending ? (
                              <>
                                <Loader2 className="animate-spin mr-2 h-5 w-5" />
                                Deleting...
                              </>
                            ) : (
                              <>
                                <Trash2 className="w-5 h-5 mr-2" />
                                Yes, Delete Forever
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(false)}
                            disabled={deleteAccountMutation.isPending}
                            className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
