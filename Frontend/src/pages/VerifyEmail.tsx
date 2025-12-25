import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { authApi } from "../api/auth";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

const VerifyEmail = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const hasVerified = useRef(false);

  useEffect(() => {
    const verifyEmail = async () => {
      // Prevent duplicate calls
      if (hasVerified.current) return;
      hasVerified.current = true;

      try {
        if (!token) {
          setStatus("error");
          setMessage("Invalid verification link");
          return;
        }

        console.log("Verifying email with token:", token);

        // Clear any old tokens before verification
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");

        const response = await authApi.verifyEmail(token);
        console.log("Verification response:", response);

        setStatus("success");
        setMessage("Email verified successfully! You can now login.");
        setTimeout(() => navigate("/login"), 3000);
      } catch (error: unknown) {
        console.error("Verification error:", error);
        const err = error as { response?: { data?: { message?: string } } };
        const errorMsg =
          err.response?.data?.message || "Email verification failed";

        // If link was already used, it means verification succeeded earlier
        if (errorMsg.includes("Invalid or expired")) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");

          setStatus("success");
          setMessage("Your email is already verified! You can login now.");
          setTimeout(() => navigate("/login"), 2000);
        } else {
          setStatus("error");
          setMessage(errorMsg);
        }
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-red-900 to-orange-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-2xl shadow-2xl text-center">
        {status === "loading" && (
          <>
            <Loader2 className="w-16 h-16 text-red-500 animate-spin mx-auto" />
            <h2 className="text-2xl font-bold text-white">
              Verifying your email...
            </h2>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold text-white">Email Verified!</h2>
            <p className="text-gray-300">{message}</p>
            <p className="text-sm text-gray-400">Redirecting to login...</p>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto" />
            <h2 className="text-2xl font-bold text-white">
              Verification Failed
            </h2>
            <p className="text-gray-300">{message}</p>
            <button
              onClick={() => navigate("/login")}
              className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Go to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
