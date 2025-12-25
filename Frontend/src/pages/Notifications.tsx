import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationApi, type Notification } from "../api/notification";
import { Link } from "react-router-dom";
import { Bell, Heart, Users, Trash2, Check, CheckCheck } from "lucide-react";
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
      return <Heart className="w-5 h-5 text-red-500" />;
    case "subscribe":
      return <Users className="w-5 h-5 text-red-500" />;
    default:
      return <Bell className="w-5 h-5 text-blue-500" />;
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <p className="text-gray-400 mt-1">{unreadCount} unread</p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:from-red-600 hover:to-orange-600 transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-red-500/30 transform hover:-translate-y-0.5"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Bell className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-xl">No notifications yet</p>
            <p className="text-sm mt-2">
              You'll be notified when someone likes your videos or subscribes to
              your channel
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification: Notification) => (
              <div
                key={notification._id}
                className={`flex items-start gap-4 p-4 rounded-2xl transition-all duration-300 hover:shadow-xl border ${
                  notification.isRead
                    ? "bg-gray-800/50 backdrop-blur-sm border-gray-700/50 hover:border-gray-600/50"
                    : "bg-gray-800/80 backdrop-blur-sm border-l-4 border-red-500 shadow-lg shadow-red-500/20 hover:shadow-red-500/30"
                }`}
              >
                <NotificationIcon type={notification.type} />
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
                  <div className="flex items-start gap-3">
                    <img
                      src={notification.sender.avatar}
                      alt={notification.sender.fullName}
                      className="w-10 h-10 rounded-full flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white">
                        <span className="font-semibold">
                          {notification.sender.fullName}
                        </span>{" "}
                        {notification.message.replace(
                          notification.sender.fullName,
                          ""
                        )}
                      </p>
                      {notification.video && (
                        <div className="flex items-center gap-2 mt-2">
                          <img
                            src={notification.video.thumbnail}
                            alt={notification.video.title}
                            className="w-16 h-10 object-cover rounded"
                          />
                          <p className="text-sm text-gray-400 line-clamp-1">
                            {notification.video.title}
                          </p>
                        </div>
                      )}
                      <p className="text-sm text-gray-400 mt-1">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </Link>
                <div className="flex items-center gap-2">
                  {!notification.isRead && (
                    <button
                      onClick={() =>
                        markAsReadMutation.mutate(notification._id)
                      }
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() =>
                      deleteNotificationMutation.mutate(notification._id)
                    }
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
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
