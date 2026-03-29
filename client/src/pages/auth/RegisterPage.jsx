import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Loader2, UserPlus, Sparkles, CheckCircle2, ShieldPlus, Fingerprint } from "lucide-react";
import apiClient from "../../api/client";
import { Button } from "../../components/ui/button";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [searchParams] = useSearchParams();
  const [selectedRole, setSelectedRole] = useState("user");
  const [submissionState, setSubmissionState] = useState({
    loading: false,
    error: null,
    success: null,
  });

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (["user", "admin", "organiser"].includes(roleParam)) {
      setSelectedRole(roleParam);
    }
  }, [searchParams]);

  const handleFieldChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (submissionState.error) {
      setSubmissionState((prev) => ({ ...prev, error: null }));
    }
  };

  const submitRegistration = async (e) => {
    e.preventDefault();
    setSubmissionState({ loading: true, error: null, success: null });

    try {
      const response = await apiClient.post("/auth/register", {
        ...formData,
        role: selectedRole,
      });

      setSubmissionState({
        loading: false,
        error: null,
        success: response.message || "Account created successfully. Awaiting administrative verification.",
      });
    } catch (err) {
      setSubmissionState({
        loading: false,
        error: err.message || "Registration failed. Please try again.",
        success: null,
      });
    }
  };

  const roleTypes = {
    user: { label: "Standard", icon: UserPlus },
    organiser: { label: "Organiser", icon: Fingerprint },
    admin: { label: "Network Admin", icon: ShieldPlus },
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-zinc-50/50 p-6">
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-[10%] right-[15%] w-96 h-96 bg-purple-200/40 rounded-full blur-[100px]" />
        <div className="absolute bottom-[20%] left-[10%] w-80 h-80 bg-sky-200/30 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-[460px] relative">
        <div className="bg-white border border-zinc-100 rounded-[32px] shadow-2xl shadow-zinc-200/50 p-10">
          
          {submissionState.success ? (
            <div className="text-center animate-in zoom-in-95 duration-300">
              <div className="mx-auto w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-8 border border-emerald-100">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black text-zinc-900 mb-4 tracking-tight">Deployment Success</h2>
              <p className="text-zinc-500 font-medium mb-10 text-sm leading-relaxed">
                {submissionState.success}
              </p>
              <Link to="/login">
                <Button className="w-full h-14 rounded-2xl bg-zinc-900 font-bold uppercase tracking-widest text-xs">
                  Acknowledge & Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="flex bg-zinc-50 p-1.5 rounded-2xl mb-10 border border-zinc-100">
                {Object.entries(roleTypes).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedRole(key)}
                    className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all
                      ${selectedRole === key 
                        ? "bg-white text-zinc-900 shadow-sm border border-zinc-100" 
                        : "text-zinc-400 hover:text-zinc-600"}`}
                  >
                    {cfg.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-col items-center text-center mb-10">
                <div className="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center mb-6 shadow-xl shadow-zinc-200">
                  <UserPlus className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-black text-zinc-900 tracking-tight">Join the Collective</h2>
                <p className="mt-2 text-zinc-500 font-medium italic text-sm">Create your exploration identity</p>
              </div>

              <form onSubmit={submitRegistration} className="space-y-6">
                <div>
                  <label className="block text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-2.5 ml-1">
                    Display Name (Username)
                  </label>
                  <input
                    type="text"
                    id="username"
                    required
                    onChange={handleFieldChange}
                    className="w-full h-14 px-5 bg-zinc-50 border border-zinc-100 rounded-2xl text-zinc-900 font-semibold focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500/30 transition-all placeholder:text-zinc-300"
                    placeholder="WanderlustEntity"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-2.5 ml-1">
                    Communication (Email)
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    onChange={handleFieldChange}
                    className="w-full h-14 px-5 bg-zinc-50 border border-zinc-100 rounded-2xl text-zinc-900 font-semibold focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500/30 transition-all placeholder:text-zinc-300"
                    placeholder="traveler@world.net"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-2.5 ml-1">
                    Vault Key (Password)
                  </label>
                  <input
                    type="password"
                    id="password"
                    required
                    onChange={handleFieldChange}
                    className="w-full h-14 px-5 bg-zinc-50 border border-zinc-100 rounded-2xl text-zinc-900 font-semibold focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500/30 transition-all placeholder:text-zinc-300"
                    placeholder="••••••••"
                  />
                </div>

                {submissionState.error && (
                  <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-2xl">
                    {submissionState.error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={submissionState.loading}
                  className="w-full h-14 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-zinc-200 active:scale-95"
                >
                  {submissionState.loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Initialize Identity"
                  )}
                </Button>
              </form>

              <div className="mt-10 pt-8 border-t border-zinc-100 text-center">
                <p className="text-zinc-500 text-[11px] font-bold">
                  Already a member of our collective?{" "}
                  <Link
                    to="/login"
                    className="text-sky-600 hover:underline decoration-2 underline-offset-4"
                  >
                    Enter Vault
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
