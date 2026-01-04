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
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="w-full max-w-md glass rounded-[2.5rem] p-10 border border-white/10 shadow-2xl text-center relative z-10 animate-scale-in">
        {status === "loading" && (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center border border-blue-500/20 mx-auto">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">
              Verifying...
            </h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
              Securing your account
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center border border-emerald-500/20 mx-auto">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">Email Verified!</h2>
            <p className="text-slate-400 font-medium leading-relaxed">{message}</p>
            <div className="pt-4">
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 animate-[progress_3s_ease-in-out]"></div>
              </div>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-4">Redirecting to login</p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center border border-red-500/20 mx-auto">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">
              Failed
            </h2>
            <p className="text-slate-400 font-medium leading-relaxed">{message}</p>
            <button
              onClick={() => navigate("/login")}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-500 transition-all font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-900/20 active:scale-95"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
