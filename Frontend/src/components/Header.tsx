import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { notificationApi } from "../api/notification";
import { subscriptionApi } from "../api/subscription";
import { useState } from "react";
import {
  Search,
  Bell,
  User,
  LogOut,
  Settings,
  LayoutDashboard,
  Menu,
  X,
  Home,
  TrendingUp,
  Upload,
  MessageSquare,
  PlaySquare,
  ThumbsUp,
  History,
  Users,
} from "lucide-react";
import logo from "../assets/logo.png";

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const { data: notificationData } = useQuery({
    queryKey: ["unreadCount"],
    queryFn: () => notificationApi.getUnreadCount(),
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  const { data: subscribedChannelsData } = useQuery({
    queryKey: ["subscribedChannels", user?._id],
    queryFn: () => subscriptionApi.getSubscribedChannels(user!._id),
    enabled: !!user?._id && isAuthenticated,
  });

  const subscribedChannels = subscribedChannelsData?.data || [];
  const unreadCount = notificationData?.data?.unreadCount || 0;

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

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
      setShowMobileMenu(false);
    }
  };

  return (
    <header className="bg-gray-800/95 backdrop-blur-md border-b border-gray-700/50 sticky top-0 z-50 shadow-xl">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center">
            <img
              src={logo}
              alt="VideoTube"
              className="h-12 md:h-14 w-auto hover:scale-105 transition-transform duration-300"
            />
            <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent drop-shadow-lg">
              VideoTube
            </span>
          </Link>

          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-2xl mx-8"
          >
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search videos..."
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button
                type="submit"
                aria-label="Search videos"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden text-white"
            >
              {showMobileMenu ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

            {isAuthenticated ? (
              <>
                <Link
                  to="/notifications"
                  className="hidden md:block relative text-gray-400 hover:text-white"
                >
                  <Bell className="w-6 h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center space-x-2"
                  >
                    <img
                      src={user?.avatar}
                      alt={user?.fullName}
                      className="w-8 h-8 rounded-full border-2 border-red-500"
                    />
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden">
                      <div className="p-4 border-b border-gray-700">
                        <p className="font-semibold text-white">
                          {user?.fullName}
                        </p>
                        <p className="text-sm text-gray-400">
                          @{user?.username}
                        </p>
                      </div>
                      <div className="py-2">
                        <Link
                          to={`/channel/${user?.username}`}
                          className="flex items-center space-x-3 px-4 py-2 text-gray-300 hover:bg-gray-700"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <User className="w-5 h-5" />
                          <span>Your Channel</span>
                        </Link>
                        <Link
                          to="/dashboard"
                          className="flex items-center space-x-3 px-4 py-2 text-gray-300 hover:bg-gray-700"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <LayoutDashboard className="w-5 h-5" />
                          <span>Dashboard</span>
                        </Link>
                        <Link
                          to="/settings"
                          className="flex items-center space-x-3 px-4 py-2 text-gray-300 hover:bg-gray-700"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <Settings className="w-5 h-5" />
                          <span>Settings</span>
                        </Link>
                      </div>
                      <div className="border-t border-gray-700">
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-gray-700 w-full"
                        >
                          <LogOut className="w-5 h-5" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden md:flex space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-white hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>

        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-700">
            <div className="py-4 space-y-4 max-h-[calc(100vh-64px)] overflow-y-auto">
              <form onSubmit={handleSearch} className="px-4">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search videos..."
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <button
                    type="submit"
                    aria-label="Search videos"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </div>
              </form>

              {isAuthenticated && (
                <>
                  <div className="px-4 pb-2 border-b border-gray-700">
                    <Link
                      to={`/channel/${user?.username}`}
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center space-x-3"
                    >
                      <img
                        src={user?.avatar}
                        alt={user?.fullName}
                        className="w-12 h-12 rounded-full border-2 border-red-500"
                      />
                      <div>
                        <p className="font-semibold text-white">
                          {user?.fullName}
                        </p>
                        <p className="text-sm text-gray-400">
                          @{user?.username}
                        </p>
                      </div>
                    </Link>
                  </div>

                  <div className="px-4">
                    <Link
                      to="/notifications"
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center justify-between px-4 py-3 bg-gray-700/50 rounded-lg hover:bg-gray-700"
                    >
                      <div className="flex items-center space-x-3">
                        <Bell className="w-5 h-5 text-gray-300" />
                        <span className="text-gray-300">Notifications</span>
                      </div>
                      {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </Link>
                  </div>
                </>
              )}

              <div className="px-4 space-y-1">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-4">
                  Navigation
                </div>
                {mainLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <link.icon className="w-5 h-5" />
                    <span>{link.label}</span>
                  </Link>
                ))}
              </div>

              {isAuthenticated && userLinks.length > 0 && (
                <div className="px-4 space-y-1 border-t border-gray-700 pt-4">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-4">
                    Your Content
                  </div>
                  {userLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <link.icon className="w-5 h-5" />
                      <span>{link.label}</span>
                    </Link>
                  ))}
                </div>
              )}

              {isAuthenticated && subscribedChannels.length > 0 && (
                <div className="px-4 space-y-2 border-t border-gray-700 pt-4">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-4">
                    Subscriptions
                  </div>
                  <div className="space-y-1">
                    {subscribedChannels.slice(0, 5).map(
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
                          onClick={() => setShowMobileMenu(false)}
                          className="flex items-center space-x-3 px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <img
                            src={sub.channel.avatar}
                            alt={sub.channel.fullName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <span className="text-sm truncate">
                            {sub.channel.fullName}
                          </span>
                        </Link>
                      )
                    )}
                    {subscribedChannels.length > 5 && (
                      <p className="text-xs text-gray-500 px-4 py-2">
                        +{subscribedChannels.length - 5} more
                      </p>
                    )}
                  </div>
                </div>
              )}

              {isAuthenticated && (
                <div className="px-4 space-y-1 border-t border-gray-700 pt-4">
                  <Link
                    to="/settings"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowMobileMenu(false);
                    }}
                    className="flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-gray-700 rounded-lg transition-colors w-full"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              )}

              {!isAuthenticated && (
                <div className="px-4 space-y-2">
                  <Link
                    to="/login"
                    className="block px-4 py-3 text-white bg-gray-700 rounded-lg text-center hover:bg-gray-600 transition-colors"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block px-4 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg text-center hover:from-red-600 hover:to-orange-600 transition-colors"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
