import React, { useEffect, useState, useCallback } from "react";
import { Search, Compass, Globe, Clock, Zap, MapPin, UserCheck, ArrowUpRight, Loader2, SlidersHorizontal } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import apiClient from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/ui/toast";
import { Button } from "../components/ui/button";

const ExplorePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [collectiveJourneys, setCollectiveJourneys] = useState([]);
  const [sessionBookings, setSessionBookings] = useState([]);
  const [isSyncing, setIsSyncing] = useState(true);
  const [isActionPending, setIsActionPending] = useState(null); // ID of trip being joined

  const [matrixFilters, setMatrixFilters] = useState({
    query: "",
    budget: "",
    minDays: "",
    maxDays: ""
  });

  const fetchCollectiveIntelligence = useCallback(async () => {
    setIsSyncing(true);
    try {
      const params = new URLSearchParams();
      if (matrixFilters.query) params.append("query", matrixFilters.query);
      if (matrixFilters.budget) params.append("budget", matrixFilters.budget);
      if (matrixFilters.minDays) params.append("minDays", matrixFilters.minDays);
      if (matrixFilters.maxDays) params.append("maxDays", matrixFilters.maxDays);

      const [journeysResponse, userBookingsResponse] = await Promise.all([
        apiClient.get(`/trips?${params.toString()}`),
        user ? apiClient.get("/bookings/user-bookings") : Promise.resolve({ data: [] })
      ]);

      setCollectiveJourneys(journeysResponse.data);
      setSessionBookings(userBookingsResponse.data || []);
    } catch (error) {
      console.error("Collective Sync Failure:", error);
      toast({ title: "Sync Error", description: "The collective intelligence archive is currently unreachable.", variant: "destructive" });
    } finally {
      setIsSyncing(false);
    }
  }, [matrixFilters, user, toast]);

  useEffect(() => {
    const neuralDebounce = setTimeout(fetchCollectiveIntelligence, 400);
    return () => clearTimeout(neuralDebounce);
  }, [fetchCollectiveIntelligence]);

  const initiateJoinProtocol = async (e, journey) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast({ title: "Identity Required", description: "Please authorize your session to join the collective explorations." });
      navigate("/login");
      return;
    }

    setIsActionPending(journey._id);
    try {
      await apiClient.post("/bookings/join", {
        destination: journey.destination,
        tripId: journey._id,
      });
      
      toast({ title: "Protocol Initiated", description: "Your membership queue request has been successfully transmitted." });
      // Re-sync locally or update status
      setSessionBookings(prev => [...prev, { tripId: { _id: journey._id }, status: "pending" }]);
    } catch (error) {
       toast({ title: "Protocol Failure", description: error.message || "The join request could not be established.", variant: "destructive" });
    } finally {
       setIsActionPending(null);
    }
  };

  const updateMatrixFilter = (e) => {
    const { name, value } = e.target;
    setMatrixFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-white px-6 sm:px-10 md:px-24 py-16 selection:bg-zinc-900 selection:text-white">
      
      {/* Dynamic Exploration Header */}
      <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-20">
         <div className="bg-zinc-50 text-zinc-400 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-8 border border-zinc-100 flex items-center gap-2">
            <Globe className="w-3.5 h-3.5" />
            Global Collective Archive
         </div>
         <h1 className="text-5xl md:text-8xl font-black text-zinc-900 tracking-tighter leading-[0.9]">
            Exposed <span className="text-zinc-400">Cartographies.</span>
         </h1>
         <p className="mt-8 text-lg font-medium text-zinc-400 leading-relaxed italic max-w-2xl">
            "Every generated path becomes part of the neural pool. Explore verified itineraries designed by the collective."
         </p>
      </div>

      {/* Filter Matrix Controller */}
      <div className="max-w-7xl mx-auto mb-16">
         <div className="bg-zinc-50 border border-zinc-100 p-3 rounded-[32px] flex flex-wrap gap-4 items-center shadow-2xl shadow-zinc-100">
            <div className="flex-1 min-w-[280px] relative group">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-300 w-4 h-4 group-focus-within:text-zinc-900 transition-colors" />
               <input 
                  type="text" 
                  name="query"
                  placeholder="Query Coordinate (Destination)..."
                  value={matrixFilters.query}
                  onChange={updateMatrixFilter}
                  className="w-full h-14 pl-14 pr-6 bg-white border border-zinc-100 rounded-2xl text-sm font-black text-zinc-900 tracking-tight focus:outline-none focus:ring-4 focus:ring-sky-500/10 transition-all placeholder:text-zinc-200"
               />
            </div>
            
            <div className="flex bg-white px-4 border border-zinc-100 rounded-2xl h-14 items-center gap-3">
               <SlidersHorizontal className="w-4 h-4 text-zinc-300" />
               <select 
                 name="budget" 
                 value={matrixFilters.budget}
                 onChange={updateMatrixFilter}
                 className="bg-transparent text-xs font-black uppercase tracking-widest text-zinc-600 focus:outline-none cursor-pointer"
               >
                  <option value="">Matrix: All Budgets</option>
                  <option value="Cheap">Value Hub</option>
                  <option value="Moderate">Balanced Tier</option>
                  <option value="Luxury">Premium Matrix</option>
               </select>
            </div>

            <div className="flex items-center gap-2 h-14">
               <input 
                  type="number" 
                  name="minDays"
                  placeholder="Min"
                  value={matrixFilters.minDays}
                  onChange={updateMatrixFilter}
                  className="w-20 h-full px-4 bg-white border border-zinc-100 rounded-2xl text-xs font-black text-center focus:outline-none focus:ring-4 focus:ring-sky-500/10"
               />
               <span className="text-[10px] font-black text-zinc-200">COORD</span>
               <input 
                  type="number" 
                  name="maxDays"
                  placeholder="Max"
                  value={matrixFilters.maxDays}
                  onChange={updateMatrixFilter}
                  className="w-20 h-full px-4 bg-white border border-zinc-100 rounded-2xl text-xs font-black text-center focus:outline-none focus:ring-4 focus:ring-sky-500/10"
               />
            </div>
         </div>
      </div>

      {/* Exploration Grid Execution */}
      <div className="max-w-7xl mx-auto">
         {isSyncing ? (
            <div className="py-32 flex flex-col items-center justify-center gap-6 animate-pulse">
               <div className="w-16 h-1 bg-zinc-900 rounded-full" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Syncing Intelligence Matrix...</span>
            </div>
         ) : collectiveJourneys.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
               {collectiveJourneys.map((journey) => {
                  const localBooking = sessionBookings.find(b => (b.tripId?._id || b.tripId) === journey._id);
                  const isAuthor = user && (journey.author?._id === user?._id || journey.author === user?._id);
                  
                  return (
                     <div 
                        key={journey._id} 
                        onClick={() => navigate(`/view-trip/${journey._id}`)}
                        className="group relative bg-white border border-zinc-50 rounded-[40px] p-2 hover:bg-zinc-50/50 hover:border-zinc-100 transition-all cursor-pointer flex flex-col h-full"
                     >
                        <div className="relative h-64 w-full overflow-hidden rounded-[32px] mb-8">
                           <img 
                              src={journey.tripData?.locationMetrics?.visual || journey.tripData?.accommodations?.[0]?.imageUrl || '/placeholder.jpg'} 
                              className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 scale-105 group-hover:scale-110"
                           />
                           <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 via-transparent to-transparent opacity-40" />
                           
                           <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-zinc-900">
                              {journey.duration} Cycles
                           </div>
                           
                           {journey.status === 'approved' && (
                              <div className="absolute bottom-4 left-4 bg-sky-500 text-white px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-lg shadow-sky-200">
                                 <UserCheck className="w-3 h-3" />
                                 <span className="text-[8px] font-black uppercase tracking-widest">Verified Path</span>
                              </div>
                           )}
                        </div>

                        <div className="px-6 flex-1 flex flex-col pb-6">
                           <div className="flex-1">
                              <h3 className="text-2xl font-black text-zinc-900 tracking-tighter uppercase italic line-clamp-1 mb-2 group-hover:text-sky-600 transition-colors">
                                 {journey.destination}
                              </h3>
                              <div className="flex items-center gap-2 text-zinc-400 mb-8">
                                 <MapPin className="w-3 h-3" />
                                 <span className="text-[10px] font-bold uppercase tracking-widest italic truncate">{journey.tripData?.locationMetrics?.address || "Global Coordinate"}</span>
                              </div>
                           </div>

                           <div className="flex items-center justify-between pt-6 border-t border-zinc-100/50 gap-6">
                              <div className="flex flex-col gap-1">
                                 <span className="text-[8px] font-black text-zinc-300 uppercase tracking-widest">Budget Index</span>
                                 <span className="text-sm font-black text-zinc-900 tracking-tighter italic">{journey.budget || "BALANCED"}</span>
                              </div>

                              {isAuthor ? (
                                 <div className="bg-zinc-900 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-zinc-900">
                                    Primary Author
                                 </div>
                              ) : (
                                 <Button 
                                    onClick={(e) => initiateJoinProtocol(e, journey)}
                                    disabled={isActionPending === journey._id || !!localBooking}
                                    className={`h-12 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg
                                       ${localBooking 
                                         ? "bg-emerald-500 text-white shadow-emerald-100" 
                                         : "bg-zinc-900 hover:bg-zinc-800 text-white shadow-zinc-200"}`}
                                 >
                                    {isActionPending === journey._id ? (
                                       <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : localBooking ? (
                                       <>
                                          <UserCheck className="w-3.5 h-3.5" />
                                          {localBooking.status === 'approved' ? 'Assigned' : 'Queued'}
                                       </>
                                    ) : (
                                       <>
                                          Sync Path
                                          <ArrowUpRight className="w-3.5 h-3.5" />
                                       </>
                                    )}
                                 </Button>
                              )}
                           </div>
                        </div>
                     </div>
                  );
               })}
            </div>
         ) : (
            <div className="py-40 text-center bg-zinc-50/50 rounded-[64px] border border-zinc-100 italic">
               <Compass className="w-16 h-16 text-zinc-100 mx-auto mb-8" />
               <h3 className="text-xl font-black text-zinc-900 tracking-tight uppercase">No Coordinate Sequence Found.</h3>
               <p className="mt-2 text-zinc-400 text-sm font-bold uppercase tracking-widest">Adjust filters to resolve more intelligence.</p>
            </div>
         )}
      </div>
    </div>
  );
};

export default ExplorePage;
