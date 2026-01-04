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
    <div className="min-h-screen bg-[#0f172a] text-slate-200">
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center gap-6 mb-12">
          <div className="w-16 h-16 bg-red-600/10 rounded-3xl flex items-center justify-center border border-red-500/20">
            <User className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              Settings
            </h1>
            <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-[10px]">
              Manage your account and preferences
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass rounded-[2rem] p-4 space-y-2 border border-white/5 shadow-2xl sticky top-24">
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full text-left px-6 py-4 rounded-2xl transition-all duration-500 flex items-center gap-4 group ${
                  activeTab === "profile"
                    ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-xl shadow-red-500/20"
                    : "text-slate-500 hover:bg-white/5 hover:text-white"
                }`}
              >
                <User
                  className={`w-5 h-5 transition-transform duration-500 ${
                    activeTab === "profile"
                      ? "scale-110"
                      : "group-hover:scale-110"
                  }`}
                />
                <span className="font-black uppercase tracking-widest text-[10px]">
                  Profile
                </span>
              </button>
              <button
                onClick={() => setActiveTab("password")}
                className={`w-full text-left px-6 py-4 rounded-2xl transition-all duration-500 flex items-center gap-4 group ${
                  activeTab === "password"
                    ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-xl shadow-red-500/20"
                    : "text-slate-500 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Lock
                  className={`w-5 h-5 transition-transform duration-500 ${
                    activeTab === "password"
                      ? "scale-110"
                      : "group-hover:scale-110"
                  }`}
                />
                <span className="font-black uppercase tracking-widest text-[10px]">
                  Password
                </span>
              </button>
              <button
                onClick={() => setActiveTab("danger")}
                className={`w-full text-left px-6 py-4 rounded-2xl transition-all duration-500 flex items-center gap-4 group ${
                  activeTab === "danger"
                    ? "bg-red-600 text-white shadow-xl shadow-red-500/20"
                    : "text-slate-500 hover:bg-white/5 hover:text-white"
                }`}
              >
                <AlertTriangle
                  className={`w-5 h-5 transition-transform duration-500 ${
                    activeTab === "danger"
                      ? "scale-110"
                      : "group-hover:scale-110"
                  }`}
                />
                <span className="font-black uppercase tracking-widest text-[10px]">
                  Danger Zone
                </span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="glass rounded-[2.5rem] p-10 border border-white/5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/5 blur-[120px] -mr-48 -mt-48"></div>

              {activeTab === "profile" && (
                <div className="space-y-10 relative z-10">
                  <div>
                    <h2 className="text-3xl font-black text-white tracking-tight mb-2">
                      Profile Settings
                    </h2>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                      Update your personal information
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Avatar Upload */}
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                        Profile Picture
                      </label>
                      <div className="relative group w-40 h-40">
                        <img
                          src={user?.avatar}
                          alt={user?.fullName}
                          className="w-full h-full rounded-[2.5rem] object-cover ring-8 ring-white/5 shadow-2xl group-hover:ring-red-500/20 transition-all duration-500"
                        />
                        <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-[2.5rem] cursor-pointer backdrop-blur-sm">
                          <Upload className="w-8 h-8 text-white" />
                          <input
                            type="file"
                            className="hidden"
                            onChange={handleAvatarChange}
                            accept="image/*"
                            aria-label="Upload profile picture"
                          />
                        </label>
                        {updateAvatarMutation.isPending && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-[2.5rem] backdrop-blur-sm">
                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Cover Upload */}
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                        Cover Image
                      </label>
                      <div className="relative group h-40 rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl">
                        <img
                          src={
                            user?.coverImage ||
                            "https://images.unsplash.com/photo-1579546929518-9e396f3cc809"
                          }
                          alt="Cover"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-500 cursor-pointer backdrop-blur-sm">
                          <Upload className="w-8 h-8 text-white" />
                          <input
                            type="file"
                            className="hidden"
                            onChange={handleCoverChange}
                            accept="image/*"
                            aria-label="Upload cover image"
                          />
                        </label>
                        {updateCoverMutation.isPending && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleProfileSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                          <input
                            type="text"
                            value={profileData.fullName}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                fullName: e.target.value,
                              })
                            }
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                            placeholder="Enter your full name"
                            aria-label="Full name"
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                          <input
                            type="email"
                            value={profileData.email}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                email: e.target.value,
                              })
                            }
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                            placeholder="Enter your email address"
                            aria-label="Email address"
                          />
                        </div>
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      className="px-10 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl hover:from-red-600 hover:to-orange-600 disabled:opacity-50 transition-all duration-300 font-black uppercase tracking-widest text-xs shadow-xl shadow-red-500/20 active:scale-95 flex items-center gap-3"
                    >
                      {updateProfileMutation.isPending && (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )}
                      Save Changes
                    </button>
                  </form>
                </div>
              )}

              {activeTab === "password" && (
                <div className="space-y-10 relative z-10">
                  <div>
                    <h2 className="text-3xl font-black text-white tracking-tight mb-2">
                      Security
                    </h2>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                      Update your password
                    </p>
                  </div>

                  <form
                    onSubmit={handlePasswordSubmit}
                    className="space-y-8 max-w-xl"
                  >
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                          <input
                            type="password"
                            value={passwordData.oldPassword}
                            onChange={(e) =>
                              setPasswordData({
                                ...passwordData,
                                oldPassword: e.target.value,
                              })
                            }
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                            placeholder="Enter current password"
                            aria-label="Current password"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                          New Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                          <input
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) =>
                              setPasswordData({
                                ...passwordData,
                                newPassword: e.target.value,
                              })
                            }
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                            placeholder="Enter new password"
                            aria-label="New password"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                          <input
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) =>
                              setPasswordData({
                                ...passwordData,
                                confirmPassword: e.target.value,
                              })
                            }
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                            placeholder="Confirm new password"
                            aria-label="Confirm new password"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={changePasswordMutation.isPending}
                      className="px-10 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl hover:from-red-600 hover:to-orange-600 disabled:opacity-50 transition-all duration-300 font-black uppercase tracking-widest text-xs shadow-xl shadow-red-500/20 active:scale-95 flex items-center gap-3"
                    >
                      {changePasswordMutation.isPending && (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )}
                      Update Password
                    </button>
                  </form>
                </div>
              )}

              {activeTab === "danger" && (
                <div className="space-y-10 relative z-10">
                  <div>
                    <h2 className="text-3xl font-black text-white tracking-tight mb-2">
                      Danger Zone
                    </h2>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                      Irreversible account actions
                    </p>
                  </div>

                  <div className="p-8 rounded-[2rem] bg-red-500/5 border border-red-500/20 space-y-6">
                    <div className="flex items-start gap-6">
                      <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20 flex-shrink-0">
                        <AlertTriangle className="w-7 h-7 text-red-500" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-white mb-2">
                          Delete Account
                        </h3>
                        <p className="text-slate-400 font-medium leading-relaxed">
                          Once you delete your account, there is no going back.
                          All your videos, comments, likes, and playlists will
                          be permanently removed from our servers.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-10 py-4 bg-red-600 text-white rounded-2xl hover:bg-red-500 transition-all duration-300 font-black uppercase tracking-widest text-xs shadow-xl shadow-red-500/20 active:scale-95 flex items-center gap-3"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete My Account
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-xl"
            onClick={() => setShowDeleteConfirm(false)}
          ></div>
          <div className="glass relative w-full max-w-md rounded-[2.5rem] p-10 border border-white/10 shadow-2xl animate-scale-in">
            <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center border border-red-500/20 mx-auto mb-8">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-2xl font-black text-white text-center mb-4">
              Are you absolutely sure?
            </h3>
            <p className="text-slate-400 text-center font-medium leading-relaxed mb-10">
              This action is permanent and cannot be undone. You will lose
              access to all your content immediately.
            </p>
            <div className="flex flex-col gap-4">
              <button
                onClick={handleDeleteAccount}
                disabled={deleteAccountMutation.isPending}
                className="w-full py-4 bg-red-600 text-white rounded-2xl hover:bg-red-500 transition-all font-black uppercase tracking-widest text-xs shadow-xl shadow-red-500/20 active:scale-95 flex items-center justify-center gap-3"
              >
                {deleteAccountMutation.isPending && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                Yes, Delete Everything
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full py-4 bg-white/5 text-white rounded-2xl hover:bg-white/10 transition-all font-black uppercase tracking-widest text-xs border border-white/10"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
