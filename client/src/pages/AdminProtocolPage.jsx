import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ShieldCheck, Users, Map, CheckCircle, XCircle, Trash2, 
  Loader2, Filter, Activity, Zap, Layers, Globe, ArrowUpRight
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import apiClient from "../api/client";
import { Button } from "../components/ui/button";
import { useToast } from "../components/ui/toast";

const AdminProtocolPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [collectiveUsers, setCollectiveUsers] = useState([]);
  const [activeTrips, setActiveTrips] = useState([]);
  const [membershipRequests, setMembershipRequests] = useState([]);
  const [isSyncing, setIsSyncing] = useState(true);
  const [matrixTab, setMatrixTab] = useState("users"); // users, bookings, trips

  const syncMatrixIntelligence = useCallback(async () => {
    setIsSyncing(true);
    try {
      if (matrixTab === "users") {
        const res = await apiClient.get("/users");
        setCollectiveUsers(res.data);
      } else if (matrixTab === "bookings") {
        const res = await apiClient.get("/bookings/admin/all");
        setMembershipRequests(res.data);
      } else {
        const res = await apiClient.get("/trips/admin/all");
        setActiveTrips(res.data);
      }
    } catch (error) {
       console.error("Matrix Sync Failure:", error);
       toast({ title: "Sync Failure", description: "The central intelligence matrix is currently offline.", variant: "destructive" });
    } finally {
       setIsSyncing(false);
    }
  }, [matrixTab, toast]);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    syncMatrixIntelligence();
  }, [user, navigate, syncMatrixIntelligence]);

  const executeIdentityAction = async (id, protocol) => {
    try {
      await apiClient.patch(`/users/${id}/${protocol}`);
      toast({ title: "Identity Re-indexed", description: `Protocol '${protocol}' successfully synchronized.` });
      syncMatrixIntelligence();
    } catch (error) {
       toast({ title: "Protocol Error", description: "Failed to update identity parameters.", variant: "destructive" });
    }
  };

  const handleTripValidation = async (id, status) => {
    try {
      await apiClient.patch(`/trips/${id}/status`, { status });
      toast({ title: "Trip Validated", description: `Sequence status updated to ${status}.` });
      syncMatrixIntelligence();
    } catch (error) {
       toast({ title: "Validation Error", description: "The trip sequence could not be resolved.", variant: "destructive" });
    }
  };

  const terminateIdentity = async (id) => {
    if (!window.confirm("CRITICAL: Terminate this identity? All associated neural links will be severed.")) return;
    try {
      await apiClient.delete(`/users/${id}`);
      setCollectiveUsers(prev => prev.filter(u => u._id !== id));
      toast({ title: "Identity Severed", description: "The entity has been removed from the collective." });
    } catch (error) {
       toast({ title: "Severance Error", description: "Unable to complete termination protocol.", variant: "destructive" });
    }
  };

  if (isSyncing && (collectiveUsers.length === 0 && activeTrips.length === 0 && membershipRequests.length === 0)) {
    return (
       <div className="min-h-screen flex flex-col justify-center items-center gap-6 animate-pulse">
          <div className="w-16 h-1 bg-zinc-900 rounded-full" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Syncing Admin Matrix...</span>
       </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-6 md:px-24 py-16 selection:bg-zinc-900 selection:text-white">
      
      {/* Protocol Header */}
      <div className="max-w-7xl mx-auto mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
         <div className="flex flex-col gap-4">
            <div className="bg-sky-50 text-sky-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-sky-100 w-fit flex items-center gap-2">
               <ShieldCheck className="w-4 h-4" />
               Level 0 Secure Access
            </div>
            <h1 className="text-5xl font-black text-zinc-900 tracking-tighter uppercase italic leading-none">
               Protocol <span className="text-zinc-400">Dashboard.</span>
            </h1>
         </div>
         
         {/* Metric Quick-View */}
         <div className="flex gap-10">
            <div className="flex flex-col gap-1">
               <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">Active Entities</span>
               <span className="text-xl font-black text-zinc-900 tracking-tighter italic">{collectiveUsers.length}</span>
            </div>
            <div className="flex flex-col gap-1">
               <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">Global Paths</span>
               <span className="text-xl font-black text-zinc-900 tracking-tighter italic">{activeTrips.length}</span>
            </div>
         </div>
      </div>

      {/* Control Matrix Selection */}
      <div className="max-w-7xl mx-auto mb-10 overflow-x-auto">
         <div className="bg-zinc-50 p-2 rounded-[32px] border border-zinc-100 flex gap-2 w-fit">
            {[
              { id: "users", label: "Entity Collective", icon: Users },
              { id: "bookings", label: "Join Protocols", icon: Zap },
              { id: "trips", label: "Map Requests", icon: Globe }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setMatrixTab(tab.id)}
                className={`h-14 px-8 rounded-2xl flex items-center gap-4 transition-all
                  ${matrixTab === tab.id ? "bg-zinc-900 text-white shadow-xl shadow-zinc-200" : "bg-transparent text-zinc-400 hover:bg-zinc-100"}`}
              >
                 <tab.icon className={`w-4 h-4 ${matrixTab === tab.id ? "text-sky-400" : "text-zinc-300"}`} />
                 <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
              </button>
            ))}
         </div>
      </div>

      {/* The Intelligence Grid */}
      <div className="max-w-7xl mx-auto">
         <div className="bg-white border border-zinc-100 rounded-[48px] overflow-hidden shadow-2xl shadow-zinc-100">
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="border-b border-zinc-50">
                        {matrixTab === 'users' ? (
                          <>
                             <th className="px-10 py-8 text-[10px] font-black text-zinc-300 uppercase tracking-widest">Identified Alias</th>
                             <th className="px-10 py-8 text-[10px] font-black text-zinc-300 uppercase tracking-widest">Coordinate</th>
                             <th className="px-10 py-8 text-[10px] font-black text-zinc-300 uppercase tracking-widest">Protocol Role</th>
                             <th className="px-10 py-8 text-[10px] font-black text-zinc-300 uppercase tracking-widest">Matrix Status</th>
                          </>
                        ) : matrixTab === 'bookings' ? (
                          <>
                             <th className="px-10 py-8 text-[10px] font-black text-zinc-300 uppercase tracking-widest">Target Sequence</th>
                             <th className="px-10 py-8 text-[10px] font-black text-zinc-300 uppercase tracking-widest">Requesting Entity</th>
                             <th className="px-10 py-8 text-[10px] font-black text-zinc-300 uppercase tracking-widest">Sync Level</th>
                          </>
                        ) : (
                          <>
                             <th className="px-10 py-8 text-[10px] font-black text-zinc-300 uppercase tracking-widest">Path Destination</th>
                             <th className="px-10 py-8 text-[10px] font-black text-zinc-300 uppercase tracking-widest">Primary Origin</th>
                             <th className="px-10 py-8 text-[10px] font-black text-zinc-300 uppercase tracking-widest">Validation Status</th>
                          </>
                        )}
                        <th className="px-10 py-8 text-[10px] font-black text-zinc-300 uppercase tracking-widest text-right">Action Protocol</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                     {matrixTab === 'users' ? collectiveUsers.map((entity) => (
                        <tr key={entity._id} className="group hover:bg-zinc-50/50 transition-colors">
                           <td className="px-10 py-8 text-sm font-black text-zinc-900 tracking-tight uppercase italic">{entity.username}</td>
                           <td className="px-10 py-8 text-xs font-bold text-zinc-400 italic">{entity.email}</td>
                           <td className="px-10 py-8">
                              <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${entity.role === 'admin' ? 'bg-zinc-900 text-white' : 'bg-zinc-50 text-zinc-400'}`}>
                                 {entity.role}
                              </span>
                           </td>
                           <td className="px-10 py-8">
                              <div className={`w-2.5 h-2.5 rounded-full ${entity.isVerified ? 'bg-sky-500' : 'bg-zinc-200'} shadow-sm`} />
                           </td>
                           <td className="px-10 py-8 text-right">
                              <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <Button onClick={() => executeIdentityAction(entity._id, entity.isVerified ? 'revoke' : 'verify')} variant="ghost" className="h-10 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest text-zinc-900 hover:bg-zinc-100">
                                    {entity.isVerified ? 'Revoke Access' : 'Authorize Entity'}
                                 </Button>
                                 <Button onClick={() => terminateIdentity(entity._id)} variant="ghost" className="h-10 w-10 p-0 rounded-xl text-zinc-300 hover:text-rose-500 hover:bg-rose-50">
                                    <Trash2 className="w-4 h-4" />
                                 </Button>
                              </div>
                           </td>
                        </tr>
                     )) : matrixTab === 'trips' ? activeTrips.map((path) => (
                        <tr key={path._id} className="group hover:bg-zinc-50/50 transition-colors">
                           <td className="px-10 py-8 text-sm font-black text-zinc-900 tracking-tight uppercase italic">
                              {path.destination}
                           </td>
                           <td className="px-10 py-8 text-xs font-bold text-zinc-400 italic">{path.userId?.username || 'ANON_ENTITY'}</td>
                           <td className="px-10 py-8">
                              <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${path.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-50 text-zinc-300'}`}>
                                 {path.status || 'QUEUEING'}
                              </span>
                           </td>
                           <td className="px-10 py-8 text-right">
                              <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                 {path.status !== 'approved' && (
                                    <Button onClick={() => handleTripValidation(path._id, 'approved')} className="h-10 px-4 bg-zinc-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest">
                                       Validate Path
                                    </Button>
                                 )}
                                 <Button  variant="ghost" className="h-10 w-10 p-0 rounded-xl text-zinc-300 hover:text-rose-500">
                                    <Trash2 className="w-4 h-4" />
                                 </Button>
                              </div>
                           </td>
                        </tr>
                     )) : membershipRequests.map((req) => (
                        <tr key={req._id} className="group hover:bg-zinc-50/50 transition-colors">
                           <td className="px-10 py-8">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 rounded-xl overflow-hidden grayscale group-hover:grayscale-0 transition-all">
                                    <img src={req.hotelImage || '/placeholder.jpg'} />
                                 </div>
                                 <div>
                                    <div className="text-sm font-black text-zinc-900 uppercase italic">{req.destination}</div>
                                    <div className="text-[10px] font-bold text-zinc-300 italic">{req.hotelName}</div>
                                 </div>
                              </div>
                           </td>
                           <td className="px-10 py-8 text-xs font-bold text-zinc-400 italic uppercase tracking-tighter">
                              {req.userId?.username || 'UNKNOWN'}
                           </td>
                           <td className="px-10 py-8">
                              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-300">{req.status || 'PENDING_VALIDATION'}</span>
                           </td>
                           <td className="px-10 py-8 text-right">
                              <div className="flex justify-end gap-3">
                                 <button onClick={() => apiClient.put(`/bookings/admin/validate/${req._id}`, { status: 'approved' }).then(syncMatrixIntelligence)} className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-300 hover:bg-emerald-500 hover:text-white transition-all">
                                    <CheckCircle className="w-4 h-4" />
                                 </button>
                                 <button onClick={() => apiClient.put(`/bookings/admin/validate/${req._id}`, { status: 'rejected' }).then(syncMatrixIntelligence)} className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-300 hover:bg-rose-500 hover:text-white transition-all">
                                    <XCircle className="w-4 h-4" />
                                 </button>
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
    </div>
  );
};

export default AdminProtocolPage;
