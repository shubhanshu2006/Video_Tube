import { createContext, useState, useEffect, type ReactNode } from "react";
import type { User } from "../types";
import { authApi } from "../api/auth";
import toast from "react-hot-toast";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (token) {
        const response = await authApi.getCurrentUser();
        // Backend returns user data directly in response.data
        setUser(response.data);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log("AuthContext: Calling login API...");
      const response = await authApi.login(email, password);
      console.log("AuthContext: Login API response:", response);

      // Backend returns data wrapped in ApiResponse format
      const userData = response.data.user;
      const accessToken = response.data.accessToken;

      console.log("AuthContext: Setting user and token", {
        userData,
        hasToken: !!accessToken,
      });

      setUser(userData);
      localStorage.setItem("accessToken", accessToken);
      toast.success("Login successful!");
    } catch (error: unknown) {
      console.error("AuthContext: Login failed", error);
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage = err.response?.data?.message || "Login failed";

      if (errorMessage.includes("User does not exist")) {
        toast.error(
          "Account not found. Please register or verify your email first."
        );
      } else if (errorMessage.includes("verify your email")) {
        toast.error(
          "Please verify your email before logging in. Check your inbox."
        );
      } else {
        toast.error(errorMessage);
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      setUser(null);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      toast.success("Logged out successfully");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Logout failed");
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authApi.getCurrentUser();
      // Backend returns user data directly in response.data
      setUser(response.data);
    } catch (error) {
      console.error("Failed to refresh user:", error);
      localStorage.removeItem("accessToken");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
