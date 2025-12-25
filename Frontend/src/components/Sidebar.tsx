import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { subscriptionApi } from "../api/subscription";
import {
  Home,
  ThumbsUp,
  History,
  PlaySquare,
  Upload,
  LayoutDashboard,
  TrendingUp,
  Users,
  MessageSquare,
} from "lucide-react";

const Sidebar = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  const { data: subscribedChannelsData, isLoading: isLoadingSubscriptions } =
    useQuery({
      queryKey: ["subscribedChannels", user?._id],
      queryFn: () => subscriptionApi.getSubscribedChannels(user!._id),
      enabled: !!user?._id && isAuthenticated,
    });

  const subscribedChannels = subscribedChannelsData?.data || [];

  // Debug logging
  console.log("Sidebar Debug:", {
    isAuthenticated,
    userId: user?._id,
    isLoadingSubscriptions,
    subscribedChannelsData,
    subscribedChannels,
    channelsCount: subscribedChannels.length,
  });

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const mainLinks = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/trending", icon: TrendingUp, label: "Trending" },
  ];

  const userLinks = isAuthenticated
    ? [
        { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { path: "/upload", icon: Upload, label: "Upload Video" },
        { path: "/tweets", icon: MessageSquare, label: "Community" },
        { path: "/playlists", icon: PlaySquare, label: "Playlists" },
        { path: "/liked", icon: ThumbsUp, label: "Liked Videos" },
        { path: "/history", icon: History, label: "History" },
        { path: "/subscribers", icon: Users, label: "My Subscribers" },
      ]
    : [];

  return (
    <aside className="hidden md:block w-64 bg-gradient-to-b from-gray-800/95 to-gray-900/95 backdrop-blur-md min-h-screen border-r border-gray-700/50 sticky top-16 shadow-2xl">
      <div className="p-4 space-y-1">
        {/* Main Links */}
        <div className="space-y-1">
          {mainLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(link.path)
                  ? "bg-red-500 text-white"
                  : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              <link.icon className="w-5 h-5" />
              <span>{link.label}</span>
            </Link>
          ))}
        </div>

        {isAuthenticated && (
          <>
            <div className="border-t border-gray-700 my-4"></div>
            <div className="space-y-1">
              {userLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(link.path)
                      ? "bg-red-500 text-white"
                      : "text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
          </>
        )}

        {isAuthenticated && (
          <>
            <div className="border-t border-gray-700 my-4"></div>
            <div className="px-4 py-2">
              <div className="flex items-center space-x-2 text-gray-400 text-sm font-semibold mb-2">
                <Users className="w-4 h-4" />
                <span>SUBSCRIPTIONS</span>
              </div>
              {subscribedChannels.length > 0 ? (
                <div className="space-y-2 mt-3">
                  {subscribedChannels.map(
                    (sub: {
                      _id: string;
                      channel: {
                        _id: string;
                        username: string;
                        fullName: string;
                        avatar: string;
                      };
                    }) => (
                      <Link
                        key={sub._id}
                        to={`/channel/${sub.channel.username}`}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <img
                          src={sub.channel.avatar}
                          alt={sub.channel.fullName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <span className="text-sm text-gray-300 truncate">
                          {sub.channel.fullName}
                        </span>
                      </Link>
                    )
                  )}
                </div>
              ) : (
                <p className="text-xs text-gray-500 mt-2">
                  Channels you subscribe to will appear here
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
