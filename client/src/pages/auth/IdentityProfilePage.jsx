import React, { useState, useEffect } from "react";
import { User, Mail, Phone, Shield, Camera, Save, Fingerprint, Activity, Clock, LogOut } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import apiClient from "../../api/client";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useToast } from "../../components/ui/toast";

const IdentityProfilePage = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("core"); // core, security
  const [isProcessing, setIsProcessing] = useState(false);

  const [identityData, setIdentityData] = useState({
    username: "",
    email: "",
    bio: "",
    phone: "",
    avatar: ""
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    if (user) {
      setIdentityData({
        username: user.username || "",
        email: user.email || "",
        bio: user.bio || "",
        phone: user.phone || "",
        avatar: user.avatar || ""
      });
    }
  }, [user]);

  const updateIdentityProtocol = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      await apiClient.put("/users/profile", identityData);
      toast({ title: "Identity Updated", description: "Your core profile metrics have been synchronized." });
    } catch (error) {
       toast({ title: "Sync Failure", description: "Unable to update profile parameters.", variant: "destructive" });
    } finally {
       setIsProcessing(false);
    }
  };

  const updateSecurityProtocol = async (e) => {
    e.preventDefault();
    if (securityData.newPassword !== securityData.confirmPassword) {
      toast({ title: "Mismatch", description: "The new password sequence does not match.", variant: "destructive" });
      return;
    }
    
    setIsProcessing(true);
    try {
      await apiClient.put("/users/change-password", {
        currentPassword: securityData.currentPassword,
        newPassword: securityData.newPassword
      });
      toast({ title: "Security Matrix Reset", description: "Your authentication keys have been successfully rotated." });
      setSecurityData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
       toast({ title: "Access Denied", description: "The current credential provided is invalid.", variant: "destructive" });
    } finally {
       setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-zinc-50/30 px-6 sm:px-10 py-16 selection:bg-zinc-900 selection:text-white">
      <div className="max-w-6xl mx-auto flex flex-col gap-12">
        
        {/* Dynamic Header Composition */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div>
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-12 h-1 bg-zinc-900 rounded-full" />
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Personal Archive</span>
              </div>
              <h1 className="text-5xl font-black text-zinc-900 tracking-tighter leading-none">
                 Identity <span className="text-zinc-400">Settings.</span>
              </h1>
           </div>
           <Button variant="ghost" onClick={signOut} className="text-rose-500 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-rose-50 rounded-xl px-6 h-12 transition-all">
              <LogOut className="w-4 h-4" />
              Terminate Session
           </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
           
           {/* Sidebar Control Matrix */}
           <div className="lg:col-span-4 flex flex-col gap-8">
              <div className="bg-white border border-zinc-100 rounded-[40px] p-8 flex flex-col items-center text-center shadow-2xl shadow-zinc-100">
                 <div className="relative group mb-6">
                    <div className="w-32 h-32 rounded-[48px] overflow-hidden bg-zinc-50 border-4 border-white shadow-xl flex items-center justify-center transition-transform group-hover:scale-105 duration-700">
                       {identityData.avatar ? (
                          <img src={identityData.avatar} className="w-full h-full object-cover" />
                       ) : (
                          <User className="w-12 h-12 text-zinc-200" />
                       )}
                    </div>
                    <button className="absolute bottom-[-10px] right-[-10px] w-10 h-10 bg-zinc-900 text-white rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-all border-4 border-white">
                       <Camera className="w-4 h-4" />
                    </button>
                 </div>
                 <h2 className="text-2xl font-black text-zinc-900 tracking-tighter uppercase italic">{user?.username}</h2>
                 <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-2">{user?.email}</p>
                 
                 <div className="w-full h-px bg-zinc-50 my-8" />
                 
                 <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="flex flex-col items-center gap-1 p-4 bg-zinc-50 rounded-3xl">
                       <Activity className="w-4 h-4 text-sky-500 mb-1" />
                       <span className="text-[9px] font-black uppercase text-zinc-900">Active</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 p-4 bg-zinc-50 rounded-3xl">
                       <Fingerprint className="w-4 h-4 text-emerald-500 mb-1" />
                       <span className="text-[9px] font-black uppercase text-zinc-900">Verified</span>
                    </div>
                 </div>
              </div>

              <div className="bg-white border border-zinc-100 rounded-[40px] p-4 flex flex-col gap-2">
                 {[
                   { id: "core", label: "Core Identity", icon: User },
                   { id: "security", label: "Security Matrix", icon: Shield }
                 ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`h-14 px-6 rounded-2xl flex items-center gap-4 transition-all
                        ${activeTab === tab.id ? "bg-zinc-900 text-white shadow-lg shadow-zinc-200" : "bg-transparent text-zinc-400 hover:bg-zinc-50"}`}
                    >
                       <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "text-sky-400" : "text-zinc-300"}`} />
                       <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
                    </button>
                 ))}
              </div>
           </div>

           {/* Execution Platform (Forms) */}
           <div className="lg:col-span-8 bg-white border border-zinc-100 rounded-[48px] p-10 md:p-16 shadow-2xl shadow-zinc-100">
              {activeTab === "core" ? (
                <form onSubmit={updateIdentityProtocol} className="flex flex-col gap-10 animate-in fade-in duration-500">
                   <div className="flex items-center gap-4">
                      <div className="w-2 h-10 bg-zinc-900 rounded-full" />
                      <h3 className="text-3xl font-black text-zinc-900 tracking-tight italic uppercase">Update Core Matrix</h3>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Identified Alias</label>
                         <Input 
                            value={identityData.username}
                            onChange={(e) => setIdentityData({...identityData, username: e.target.value})}
                            className="h-14 bg-zinc-50 border-none rounded-2xl font-black text-xs text-zinc-900 px-6 focus:ring-4 focus:ring-sky-500/10 transition-all"
                         />
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Verified Coordinate (Email)</label>
                         <Input 
                            value={identityData.email}
                            disabled
                            className="h-14 bg-zinc-100 border-none rounded-2xl font-black text-xs text-zinc-400 px-6 opacity-60 italic"
                         />
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Voice Comm (Phone)</label>
                         <Input 
                            value={identityData.phone}
                            onChange={(e) => setIdentityData({...identityData, phone: e.target.value})}
                            className="h-14 bg-zinc-50 border-none rounded-2xl font-black text-xs text-zinc-900 px-6 focus:ring-4 focus:ring-sky-500/10 transition-all"
                            placeholder="+1 000 000 000"
                         />
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Visual Descriptor (Avatar)</label>
                         <Input 
                            value={identityData.avatar}
                            onChange={(e) => setIdentityData({...identityData, avatar: e.target.value})}
                            className="h-14 bg-zinc-50 border-none rounded-2xl font-black text-xs text-zinc-900 px-6 focus:ring-4 focus:ring-sky-500/10 transition-all"
                            placeholder="URL Reference"
                         />
                      </div>
                      <div className="md:col-span-2 space-y-3">
                         <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Personnel Descriptor (Bio)</label>
                         <textarea 
                            value={identityData.bio}
                            onChange={(e) => setIdentityData({...identityData, bio: e.target.value})}
                            className="w-full h-32 p-6 bg-zinc-50 border-none rounded-[32px] font-medium text-xs text-zinc-900 focus:outline-none focus:ring-4 focus:ring-sky-500/10 transition-all italic"
                            placeholder="Input identity summary..."
                         />
                      </div>
                   </div>

                   <Button type="submit" disabled={isProcessing} className="h-16 bg-zinc-900 hover:bg-zinc-800 text-white font-black text-xs uppercase tracking-widest rounded-2xl w-full md:w-auto px-12 shadow-xl shadow-zinc-200">
                      {isProcessing ? "Synchronizing..." : "Synchronize Core Identity"}
                   </Button>
                </form>
              ) : (
                <form onSubmit={updateSecurityProtocol} className="flex flex-col gap-10 animate-in fade-in duration-500">
                   <div className="flex items-center gap-4">
                      <div className="w-2 h-10 bg-rose-500 rounded-full" />
                      <h3 className="text-3xl font-black text-zinc-900 tracking-tight italic uppercase">Security Protocols</h3>
                   </div>

                   <div className="space-y-8 max-w-md">
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Existing Key (Current Password)</label>
                         <Input 
                            type="password"
                            value={securityData.currentPassword}
                            onChange={(e) => setSecurityData({...securityData, currentPassword: e.target.value})}
                            className="h-14 bg-zinc-50 border-none rounded-2xl font-black text-xs text-zinc-900 px-6 focus:ring-4 focus:ring-sky-500/10 transition-all"
                         />
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">New Protocol Key (New Password)</label>
                         <Input 
                            type="password"
                            value={securityData.newPassword}
                            onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})}
                            className="h-14 bg-zinc-50 border-none rounded-2xl font-black text-xs text-zinc-900 px-6 focus:ring-4 focus:ring-sky-500/10 transition-all"
                         />
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Confirm Rotation Key</label>
                         <Input 
                            type="password"
                            value={securityData.confirmPassword}
                            onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})}
                            className="h-14 bg-zinc-50 border-none rounded-2xl font-black text-xs text-zinc-900 px-6 focus:ring-4 focus:ring-sky-500/10 transition-all"
                         />
                      </div>
                   </div>

                   <Button type="submit" disabled={isProcessing} className="h-16 bg-zinc-900 hover:bg-zinc-800 text-white font-black text-xs uppercase tracking-widest rounded-2xl w-full md:w-auto px-12 shadow-xl shadow-zinc-200">
                      {isProcessing ? "Rotating Matrix Keys..." : "Update Security Protocols"}
                   </Button>
                </form>
              )}
           </div>

        </div>
      </div>
    </div>
  );
};

export default IdentityProfilePage;
