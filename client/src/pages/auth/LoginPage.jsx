import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, LogIn, ShieldCheck, User, PlaneTakeoff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../api/client";
import { Button } from "../../components/ui/button";

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [authSegment, setAuthSegment] = useState("user"); // "user" | "organiser" | "admin"
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);

  const { dispatch } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (localError) setLocalError(null);
  };

  const executeSignIn = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLocalError(null);
    dispatch({ type: "AUTH_START" });

    try {
      const response = await apiClient.post("/auth/login", formData);
      const { user } = response;

      // Validation logic for role-based sessions
      if (authSegment === "admin" && user.role !== "admin") {
        throw new Error("Administrative privileges required for this portal.");
      }
      if (authSegment === "organiser" && user.role !== "organiser" && user.role !== "admin") {
        throw new Error("Organiser access level required.");
      }
      if (authSegment === "user" && user.role === "admin") {
         throw new Error("Administrators must use the dedicated Admin Portal.");
      }

      dispatch({ type: "AUTH_SUCCESS", payload: user });

      // Navigate based on verified role
      if (user.role === "admin" && authSegment === "admin") navigate("/admin");
      else if (user.role === "organiser" || (user.role === "admin" && authSegment === "organiser")) navigate("/organiser");
      else navigate("/");

    } catch (err) {
      const msg = err.message || "Credential verification failed.";
      setLocalError(msg);
      dispatch({ type: "AUTH_FAILURE", payload: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const segmentConfigs = {
    user: { label: "User", color: "sky", icon: User },
    organiser: { label: "Organiser", color: "indigo", icon: PlaneTakeoff },
    admin: { label: "Administrator", color: "zinc", icon: ShieldCheck },
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-zinc-50/50 p-6 selection:bg-zinc-900 selection:text-white">
      {/* Decorative Atmosphere */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
        <div className="absolute top-[20%] left-[10%] w-96 h-96 bg-sky-200/40 rounded-full blur-[100px]" />
        <div className="absolute bottom-[10%] right-[10%] w-80 h-80 bg-indigo-200/30 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-[440px] relative">
        <div className="bg-white border border-zinc-100 rounded-[32px] shadow-2xl shadow-zinc-200/50 p-10">
          
          {/* Internal Segment Selector */}
          <div className="flex bg-zinc-50 p-1.5 rounded-2xl mb-10 border border-zinc-100">
            {Object.entries(segmentConfigs).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setAuthSegment(key)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all
                  ${authSegment === key 
                    ? "bg-white text-zinc-900 shadow-sm border border-zinc-100" 
                    : "text-zinc-400 hover:text-zinc-600"}`}
              >
                {config.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col items-center text-center mb-10">
            <div className={`w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center mb-6 shadow-xl shadow-zinc-200`}>
               <LogIn className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-black text-zinc-900 tracking-tight">
              Access {segmentConfigs[authSegment].label}
            </h2>
            <p className="mt-2 text-zinc-500 font-medium italic text-sm">
              Resume your world exploration
            </p>
          </div>

          <form onSubmit={executeSignIn} className="space-y-6">
            <div>
              <label className="block text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-2.5 ml-1">
                Identity (Email)
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full h-14 px-5 bg-zinc-50 border border-zinc-100 rounded-2xl text-zinc-900 font-semibold focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500/30 transition-all placeholder:text-zinc-300"
                placeholder="explorer@explorer.ai"
              />
            </div>

            <div>
              <label className="block text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-2.5 ml-1">
                Clearance (Password)
              </label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="w-full h-14 px-5 bg-zinc-50 border border-zinc-100 rounded-2xl text-zinc-900 font-semibold focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500/30 transition-all placeholder:text-zinc-300"
                placeholder="••••••••"
              />
            </div>

            {localError && (
              <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-2xl animate-in fade-in slide-in-from-top-1">
                {localError}
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-zinc-200 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Authorize Entry"
              )}
            </Button>
          </form>

          <div className="mt-10 pt-8 border-t border-zinc-100 text-center">
            <p className="text-zinc-500 text-[11px] font-bold">
              New to our exploration collective?{" "}
              <Link
                to={`/register${authSegment !== 'user' ? `?role=${authSegment}` : ''}`}
                className="text-sky-600 hover:underline decoration-2 underline-offset-4"
              >
                Join Now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
