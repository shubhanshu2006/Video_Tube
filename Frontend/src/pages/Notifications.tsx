import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationApi, type Notification } from "../api/notification";
import { Link } from "react-router-dom";
import { Bell, Heart, Users, Trash2, Check, CheckCheck, MessageCircle, Play } from "lucide-react";
import toast from "react-hot-toast";

const formatDate = (date: string) => {
  const now = new Date();
  const notifDate = new Date(date);
  const diffInMs = now.getTime() - notifDate.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSeconds < 60) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return notifDate.toLocaleDateString();
};

const NotificationIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "like":
      return (
        <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20 shadow-lg shadow-red-500/5">
          <Heart className="w-5 h-5 text-red-500 fill-red-500/20" />
        </div>
      );
    case "subscribe":
      return (
        <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20 shadow-lg shadow-red-500/5">
          <Users className="w-5 h-5 text-red-500" />
        </div>
      );
    case "comment":
      return (
        <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
          <MessageCircle className="w-5 h-5 text-emerald-500" />
        </div>
      );
    default:
      return (
        <div className="w-12 h-12 bg-slate-500/10 rounded-2xl flex items-center justify-center border border-slate-500/20 shadow-lg shadow-slate-500/5">
          <Bell className="w-5 h-5 text-slate-500" />
        </div>
      );
  }
};

const Notifications = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationApi.getNotifications({ page: 1, limit: 50 }),
  });

  const markAsReadMutation = useMutation({
    mutationFn: notificationApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: notificationApi.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
      toast.success("All notifications marked as read");
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: notificationApi.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
      toast.success("Notification deleted");
    },
  });

  const notifications = data?.data?.notifications || [];
  const unreadCount = data?.data?.unreadCount || 0;

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
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-600/10 rounded-full border border-red-500/20">
              <Bell className="w-4 h-4 text-red-500" />
              <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">Activity</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter">
              Notifications
            </h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] max-w-md leading-relaxed">
              {unreadCount > 0 
                ? `You have ${unreadCount} unread notifications waiting for your attention.` 
                : 'Stay updated with your channel activity and community interactions.'}
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
              className="px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:from-red-600 hover:to-orange-600 transition-all shadow-xl shadow-red-500/20 flex items-center gap-3 active:scale-95"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all as read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-32 glass rounded-[3rem] border border-white/5">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8">
              <Bell className="w-12 h-12 text-slate-700" />
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight mb-2">All caught up!</h3>
            <p className="text-slate-500 text-sm">No new notifications at the moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification: Notification) => (
              <div
                key={notification._id}
                className={`group relative glass rounded-[2.5rem] p-8 border transition-all duration-500 overflow-hidden ${
                  notification.isRead
                    ? "border-white/5 opacity-60 hover:opacity-100"
                    : "border-red-500/30 bg-red-600/5 shadow-2xl shadow-red-500/10"
                }`}
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/5 blur-[60px] -mr-24 -mt-24 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="flex items-start gap-8 relative z-10">
                  <NotificationIcon type={notification.type} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <Link
                        to={
                          notification.video
                            ? `/video/${notification.video._id}`
                            : `/channel/${notification.sender.username}`
                        }
                        className="flex-1 min-w-0"
                        onClick={() => {
                          if (!notification.isRead) {
                            markAsReadMutation.mutate(notification._id);
                          }
                        }}
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <img
                            src={notification.sender.avatar}
                            alt={notification.sender.fullName}
                            className="w-12 h-12 rounded-2xl object-cover ring-4 ring-white/5 shadow-xl"
                          />
                          <div>
                            <h3 className="text-lg font-black text-white tracking-tight leading-none mb-1">
                              {notification.sender.fullName}
                            </h3>
                            <span className="text-red-500 font-black text-[10px] uppercase tracking-widest">
                              @{notification.sender.username}
                            </span>
                          </div>
                        </div>

                        <p className="text-slate-300 text-base leading-relaxed mb-4">
                          {notification.message.replace(notification.sender.fullName, "").trim()}
                        </p>

                        {notification.video && (
                          <div className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-2xl border border-white/5 group-hover:border-red-500/20 transition-all">
                            <div className="relative w-24 h-14 rounded-xl overflow-hidden shadow-lg">
                              <img
                                src={notification.video.thumbnail}
                                alt={notification.video.title}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Play className="w-6 h-6 text-white fill-white" />
                              </div>
                            </div>
                            <p className="text-xs font-black text-slate-400 line-clamp-1 uppercase tracking-widest">
                              {notification.video.title}
                            </p>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 mt-6">
                          <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                            {formatDate(notification.createdAt)}
                          </span>
                          {!notification.isRead && (
                            <>
                              <span className="text-slate-700 text-[10px] font-black">•</span>
                              <span className="text-red-500 text-[10px] font-black uppercase tracking-widest">New</span>
                            </>
                          )}
                        </div>
                      </Link>

                      <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsReadMutation.mutate(notification._id)}
                            className="p-3 bg-red-600/10 hover:bg-gradient-to-r hover:from-red-500 hover:to-orange-500 text-red-500 hover:text-white rounded-xl border border-red-500/20 transition-all"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotificationMutation.mutate(notification._id)}
                          className="p-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl border border-red-500/20 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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

export default Notifications;
