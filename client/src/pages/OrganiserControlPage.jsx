import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Shield, Users, Map, MessageSquare, CheckCircle, XCircle, 
  Search, Filter, ExternalLink, Activity, ArrowUpRight, 
  Layers, Zap, Clock, ChevronRight, LayoutDashboard, Loader2
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import apiClient from "../api/client";
import { Button } from "../components/ui/button";
import { useToast } from "../components/ui/toast";

const OrganiserControlPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [managedPaths, setManagedPaths] = useState([]);
  const [membershipQueue, setMembershipQueue] = useState([]);
  const [isSyncing, setIsSyncing] = useState(true);
  const [activeMatrixTab, setActiveMatrixTab] = useState("overview");

  const syncOrganiserIntelligence = useCallback(async () => {
    setIsSyncing(true);
    try {
      const [pathsRes, queueRes] = await Promise.all([
        apiClient.get('/organiser/my-managed-trips'),
        apiClient.get('/organiser/join-requests')
      ]);
      setManagedPaths(pathsRes.data);
      setMembershipQueue(queueRes.data);
    } catch (error) {
       console.error("Organiser Sync Failure:", error);
       toast({ title: "Sync Failure", description: "Your managed intelligence stream is currently disconnected.", variant: "destructive" });
    } finally {
       setIsSyncing(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!user || (user.role !== 'organiser' && user.role !== 'admin')) {
      navigate('/');
      return;
    }
    syncOrganiserIntelligence();
  }, [user, navigate, syncOrganiserIntelligence]);

  const executeQueueAction = async (id, protocol) => {
    try {
      await apiClient.put(`/organiser/requests/${id}/validate`, { status: protocol });
      toast({ title: "Protocol Executed", description: `Entity request has been ${protocol} successfully.` });
      syncOrganiserIntelligence();
    } catch (error) {
       toast({ title: "Protocol Failure", description: "Unable to update membership parameters.", variant: "destructive" });
    }
  };

  if (isSyncing && managedPaths.length === 0 && membershipQueue.length === 0) {
    return (
       <div className="min-h-screen flex flex-col justify-center items-center gap-6 animate-pulse">
          <div className="w-16 h-1 bg-zinc-900 rounded-full" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Syncing Organiser Control...</span>
       </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row selection:bg-zinc-900 selection:text-white">
      
      {/* Lateral Control Station (Sidebar) */}
      <aside className="w-full md:w-80 border-r border-zinc-100 bg-white flex flex-col shrink-0">
         <div className="p-10 border-b border-zinc-50">
            <div className="flex items-center gap-3 mb-4">
               <div className="w-12 h-12 bg-zinc-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-zinc-200">
                  <Shield className="w-6 h-6 text-sky-400" />
               </div>
               <div>
                  <h2 className="text-xl font-black text-zinc-900 tracking-tight uppercase italic">Organiser.</h2>
                  <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Control Interface</p>
               </div>
            </div>
         </div>

         <nav className="flex-1 p-6 space-y-3">
            {[
              { id: "overview", label: "Intelligence Overview", icon: LayoutDashboard },
              { id: "trips", label: "Managed Paths", icon: Map },
              { id: "requests", label: "Personnel Queue", icon: Users },
              { id: "chat", label: "Collective Comms", icon: MessageSquare }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveMatrixTab(item.id)}
                className={`w-full h-14 px-6 rounded-2xl flex items-center gap-4 transition-all
                  ${activeMatrixTab === item.id 
                    ? "bg-zinc-900 text-white shadow-xl shadow-zinc-200 scale-[1.02]" 
                    : "text-zinc-400 hover:bg-zinc-50 hover:text-zinc-900"}`}
              >
                 <item.icon className={`w-4 h-4 ${activeMatrixTab === item.id ? "text-sky-400" : "text-zinc-300"}`} />
                 <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
              </button>
            ))}
         </nav>

         <div className="p-10">
            <div className="bg-zinc-50 rounded-[32px] p-8 border border-zinc-100">
               <div className="flex flex-col gap-1 mb-6">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-300">Active Node Load</span>
                  <span className="text-3xl font-black text-zinc-900 italic">{managedPaths.length}</span>
               </div>
               <Link to="/create-trip">
                  <Button className="w-full h-12 bg-zinc-900 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:scale-[1.05] transition-all">
                     Initiate New Path +
                  </Button>
               </Link>
            </div>
         </div>
      </aside>

      {/* Primary Execution Platform */}
      <main className="flex-1 px-8 md:px-20 py-16 bg-zinc-50/20">
         <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="flex flex-col gap-4">
               <div className="w-16 h-1 bg-zinc-900 rounded-full" />
               <h1 className="text-5xl font-black text-zinc-900 tracking-tighter uppercase italic leading-none">
                  Welcome, <span className="text-zinc-400">{user?.username || "Entity"}</span>
               </h1>
               <p className="text-sm font-medium text-zinc-400 italic">"Managed neural paths and traveler synchronization protocols verified."</p>
            </div>
         </header>

         {activeMatrixTab === 'overview' && (
            <div className="flex flex-col gap-12 animate-in fade-in duration-700">
               
               {/* Metadata Metric Grid */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-white p-8 rounded-[40px] border border-zinc-100 flex flex-col gap-4 shadow-sm hover:shadow-xl hover:bg-zinc-900 group transition-all duration-500">
                     <div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                        <Activity className="w-5 h-5 text-sky-500" />
                     </div>
                     <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white/40">Active Paths</h3>
                     <p className="text-4xl font-black text-zinc-900 italic tracking-tighter group-hover:text-white">{managedPaths.length}</p>
                  </div>
                  <div className="bg-white p-8 rounded-[40px] border border-zinc-100 flex flex-col gap-4 shadow-sm hover:shadow-xl hover:bg-zinc-900 group transition-all duration-500">
                     <div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                        <Users className="w-5 h-5 text-emerald-500" />
                     </div>
                     <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white/40">Verified Travelers</h3>
                     <p className="text-4xl font-black text-zinc-900 italic tracking-tighter group-hover:text-white">{membershipQueue.filter(r => r.status === 'approved').length}</p>
                  </div>
                  <div className="bg-white p-8 rounded-[40px] border border-zinc-100 flex flex-col gap-4 shadow-sm hover:shadow-xl hover:bg-zinc-900 group transition-all duration-500">
                     <div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                        <Zap className="w-5 h-5 text-amber-500" />
                     </div>
                     <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white/40">Pending Syncs</h3>
                     <p className="text-4xl font-black text-zinc-900 italic tracking-tighter group-hover:text-white">{membershipQueue.filter(r => r.status === 'pending').length}</p>
                  </div>
               </div>

               {/* Recent Queue Preview */}
               <div className="bg-white rounded-[48px] border border-zinc-100 overflow-hidden shadow-2xl shadow-zinc-100">
                  <div className="p-10 border-b border-zinc-50 flex items-center justify-between">
                     <h3 className="text-xl font-black text-zinc-900 tracking-tight uppercase italic flex items-center gap-3">
                        Personnel Requests
                        <span className="px-3 py-1 bg-zinc-900 text-white rounded-full text-[8px] font-black tracking-widest">{membershipQueue.length}</span>
                     </h3>
                     <button onClick={() => setActiveMatrixTab('requests')} className="text-sky-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-[1.05] transition-all">
                        Access Full Queue <ChevronRight className="w-4 h-4" />
                     </button>
                  </div>
                  <div className="divide-y divide-zinc-50">
                     {membershipQueue.slice(0, 5).map((req, idx) => (
                        <div key={idx} className="p-8 flex items-center justify-between hover:bg-zinc-50/50 transition-colors group">
                           <div className="flex items-center gap-6">
                              <div className="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-zinc-200">
                                 {req.userId?.username?.[0]?.toUpperCase()}
                              </div>
                              <div>
                                 <h4 className="text-sm font-black text-zinc-900 uppercase italic">{req.userId?.username}</h4>
                                 <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
                                    Target: <span className="text-zinc-900 font-black">{req.tripId?.destination}</span>
                                 </p>
                              </div>
                           </div>
                           <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all">
                              {req.status === 'pending' ? (
                                 <div className="flex gap-2">
                                    <button onClick={() => executeQueueAction(req._id, 'approved')} className="w-10 h-10 bg-zinc-900 text-white rounded-xl flex items-center justify-center hover:bg-emerald-500 transition-colors"><CheckCircle className="w-4 h-4" /></button>
                                    <button onClick={() => executeQueueAction(req._id, 'rejected')} className="w-10 h-10 bg-zinc-50 text-zinc-400 rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors"><XCircle className="w-4 h-4" /></button>
                                 </div>
                              ) : (
                                 <span className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] ${req.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>{req.status}</span>
                              )}
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         )}

         {activeMatrixTab === 'trips' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in slide-in-from-bottom-5 duration-700">
               {managedPaths.map((path) => (
                  <div key={path._id} 
                    onClick={() => navigate(`/view-trip/${path._id}`)}
                    className="group relative bg-white rounded-[40px] border border-zinc-100 p-2 shadow-sm hover:shadow-2xl transition-all cursor-pointer flex flex-col"
                  >
                     <div className="relative h-56 rounded-[32px] overflow-hidden mb-8">
                        <img 
                          src={path.tripData?.accommodations?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800'} 
                          className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 scale-105 group-hover:scale-110" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 to-transparent opacity-40" />
                        <div className="absolute top-6 left-6 flex gap-2">
                           <span className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl">{path.duration} Cycles</span>
                        </div>
                        <div className="absolute top-6 right-6">
                           <div className="w-10 h-10 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg"><Activity className="w-4 h-4" /></div>
                        </div>
                     </div>
                     <div className="px-8 pb-8 flex-1 flex flex-col">
                        <h3 className="text-2xl font-black text-zinc-900 tracking-tighter uppercase italic line-clamp-1 group-hover:text-sky-600 transition-colors mb-2">{path.destination}</h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300 mb-8 italic">{path.budget} MATRIX_TIER</p>
                        
                        <div className="mt-auto pt-8 border-t border-zinc-50 flex items-center justify-between">
                           <div className="flex -space-x-3">
                              {membershipQueue.filter(r => (r.tripId?._id || r.tripId) === path._id && r.status === 'approved').slice(0, 4).map((r, i) => (
                                 <div key={i} className="w-10 h-10 rounded-xl bg-zinc-900 border-4 border-white text-white flex items-center justify-center text-[10px] font-black uppercase">
                                    {r.userId?.username?.[0] || "U"}
                                 </div>
                              ))}
                              {membershipQueue.filter(r => (r.tripId?._id || r.tripId) === path._id && r.status === 'approved').length > 4 && (
                                 <div className="w-10 h-10 rounded-xl bg-zinc-50 border-4 border-white text-zinc-400 flex items-center justify-center text-[9px] font-black uppercase">
                                    +{membershipQueue.filter(r => (r.tripId?._id || r.tripId) === path._id && r.status === 'approved').length - 4}
                                 </div>
                              )}
                           </div>
                           <div className="flex items-center gap-2">
                              <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest italic">Sync_Status</span>
                              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                           </div>
                        </div>
                     </div>
                  </div>
               ))}
               {managedPaths.length === 0 && (
                  <div className="col-span-full py-32 text-center bg-white rounded-[48px] border border-zinc-100 italic">
                     <Layers className="w-16 h-16 text-zinc-100 mx-auto mb-8" />
                     <h3 className="text-xl font-black text-zinc-900 tracking-tight uppercase">No Managed Neural Paths Detected.</h3>
                     <p className="mt-2 text-zinc-400 text-sm font-bold uppercase tracking-widest">Initiate a new path to begin collective expansion.</p>
                  </div>
               )}
            </div>
         )}

         {activeMatrixTab === 'requests' && (
            <div className="flex flex-col gap-8 animate-in slide-in-from-bottom-5 duration-700">
               <div className="bg-white rounded-[48px] border border-zinc-100 overflow-hidden shadow-2xl shadow-zinc-100">
                  <div className="p-10 border-b border-zinc-50 flex flex-col md:flex-row md:items-center justify-between gap-8">
                     <div>
                        <h3 className="text-3xl font-black text-zinc-900 tracking-tight uppercase italic">Personnel Queue.</h3>
                        <p className="text-sm font-medium text-zinc-400 italic mt-2">Authorize travelers for the assigned neural paths.</p>
                     </div>
                     <div className="flex gap-2">
                        <Button variant="ghost" className="h-12 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest text-zinc-900 hover:bg-zinc-100">ALL_NODES</Button>
                        <Button className="h-12 px-6 rounded-xl bg-zinc-900 text-white font-black text-[10px] uppercase tracking-widest">AWAITING_SYNC</Button>
                     </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                     <table className="w-full text-left">
                        <thead className="bg-zinc-50/50">
                           <tr className="border-b border-zinc-50">
                              <th className="px-10 py-6 text-[10px] font-black text-zinc-300 uppercase tracking-widest">Identified Entity</th>
                              <th className="px-10 py-6 text-[10px] font-black text-zinc-300 uppercase tracking-widest">Target Destination</th>
                              <th className="px-10 py-6 text-[10px] font-black text-zinc-300 uppercase tracking-widest">Status Matrix</th>
                              <th className="px-10 py-6 text-[10px] font-black text-zinc-300 uppercase tracking-widest text-right">Access Protocol</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                           {membershipQueue.map((req) => (
                              <tr key={req._id} className="hover:bg-zinc-50/50 transition-colors group">
                                 <td className="px-10 py-8">
                                    <div className="flex items-center gap-5">
                                       <div className="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center text-white text-xs font-black shadow-lg">
                                          {req.userId?.username?.[0]?.toUpperCase()}
                                       </div>
                                       <div>
                                          <div className="text-sm font-black text-zinc-900 uppercase italic">{req.userId?.username}</div>
                                          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic">{req.userId?.email}</div>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-10 py-8 text-sm font-black text-zinc-900 italic uppercase">{req.tripId?.destination}</td>
                                 <td className="px-10 py-8">
                                    <span className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] 
                                       ${req.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : req.status === 'rejected' ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-amber-600'}`}>
                                       {req.status}
                                    </span>
                                 </td>
                                 <td className="px-10 py-8 text-right">
                                    {req.status === 'pending' ? (
                                       <div className="flex items-center justify-end gap-3">
                                          <button onClick={() => executeQueueAction(req._id, 'approved')} className="h-10 px-6 bg-zinc-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-colors shadow-xl shadow-zinc-200">VALIDATE</button>
                                          <button onClick={() => executeQueueAction(req._id, 'rejected')} className="h-10 px-6 bg-white border border-zinc-100 text-rose-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-50 transition-colors">DENY</button>
                                       </div>
                                    ) : (
                                       <span className="text-[9px] font-black text-zinc-200 uppercase tracking-widest italic">SYNC_COMPLETE</span>
                                    )}
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>
         )}
      </main>
    </div>
  );
};

export default OrganiserControlPage;
