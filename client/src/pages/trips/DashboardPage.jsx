import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Plus, Compass, LayoutDashboard, Calendar, Search, ArrowRight, ShieldCheck, Trash2, Clock, MapPin } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import apiClient from "../../api/client";
import { Button } from "../../components/ui/button";
import { useToast } from "../../components/ui/toast";

const DashboardPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [createdTrips, setCreatedTrips] = useState([]);
  const [joinedTrips, setJoinedTrips] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [tripsData, bookingsData, requestsData] = await Promise.all([
        apiClient.get("/trips/user-trips"),
        apiClient.get("/bookings/user-bookings"),
        apiClient.get("/bookings/creator-requests")
      ]);
      
      setCreatedTrips(tripsData.data);
      setJoinedTrips(bookingsData.data);
      setPendingRequests(requestsData.data);
    } catch (error) {
      console.error("Dashboard Data Extraction Failed:", error);
      toast({
        title: "Sync Error",
        description: "Unable to retrieve your journey history.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user, fetchDashboardData]);

  const removeJourney = async (journeyId) => {
    if (!window.confirm("Terminate this itinerary? This action will purge all associated messages and participant requests.")) return;
    try {
      await apiClient.delete(`/trips/${journeyId}`);
      setCreatedTrips(prev => prev.filter(t => t._id !== journeyId));
      toast({ title: "Itinerary Purged", description: "The coordinates have been wiped from your account." });
    } catch (error) {
      toast({ title: "Operation Failed", description: "Authorization error or network bottleneck.", variant: "destructive" });
    }
  };

  const cancelReservation = async (reservationId) => {
    if (!window.confirm("Rescind your join request for this itinerary?")) return;
    try {
      await apiClient.delete(`/bookings/${reservationId}`);
      setJoinedTrips(prev => prev.filter(b => b._id !== reservationId));
      toast({ title: "Request Rescinded", description: "You are no longer a participant in this journey." });
    } catch (error) {
       toast({ title: "Operation Failed", description: "Critical error during request termination.", variant: "destructive" });
    }
  };

  if (isLoading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 animate-pulse">
       <div className="w-12 h-12 bg-zinc-900 rounded-2xl" />
       <div className="text-xs font-black uppercase tracking-widest text-zinc-400">Syncing Intelligence...</div>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-64px)] bg-zinc-50/30 px-6 sm:px-10 md:px-24 py-16 selection:bg-zinc-900 selection:text-white">
      
      {/* Dynamic Command Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
        <div>
          <div className="flex items-center gap-3 mb-6">
             <div className="w-12 h-1.5 bg-zinc-900 rounded-full" />
             <div className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Personal Archive</div>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-zinc-900 tracking-tighter leading-none">
             Journey <span className="text-zinc-400">Dashboard.</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <Link to="/create-trip">
             <Button className="h-16 px-8 bg-zinc-900 hover:bg-zinc-800 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-zinc-200">
                <Plus className="w-4 h-4 mr-2" />
                Initialize New Path
             </Button>
          </Link>
          {(user?.role === 'admin' || user?.role === 'organiser') && (
            <Link to={user.role === 'admin' ? "/admin" : "/organiser"}>
              <Button variant="outline" className="h-16 px-8 border-2 border-zinc-100 bg-white hover:bg-zinc-50 font-black text-xs uppercase tracking-widest rounded-2xl text-zinc-600">
                {user.role} Console
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-32">
        
        {/* Section: Primary Explorations (Created) */}
        <section>
           <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-zinc-900 text-white rounded-xl flex items-center justify-center font-black text-xs tracking-widest shadow-lg shadow-zinc-200">
                    PRM
                 </div>
                 <h2 className="text-2xl font-black text-zinc-900 tracking-tight uppercase">Created Coordinates</h2>
              </div>
              <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                 {createdTrips.length} Entities
              </div>
           </div>

           {createdTrips.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {createdTrips.map((journey) => (
                 <div key={journey._id} className="group relative bg-white border border-zinc-100 rounded-[32px] overflow-hidden transition-all hover:shadow-2xl hover:shadow-zinc-200/50 flex flex-col h-full">
                    <Link to={`/view-trip/${journey._id}`} className="block relative h-56 overflow-hidden">
                       <img 
                          src={journey.tripData?.locationMetrics?.visual || journey.tripData?.accommodations?.[0]?.imageUrl || '/placeholder.jpg'}
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                        />
                       <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 via-transparent to-transparent opacity-80" />
                       <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-zinc-900 border border-zinc-100">
                          {journey.status}
                       </div>
                    </Link>
                    
                    <button 
                       onClick={() => removeJourney(journey._id)}
                       className="absolute top-4 left-4 p-2 bg-zinc-900/40 backdrop-blur-md text-white/80 rounded-full hover:bg-rose-500 hover:text-white transition-all z-20"
                    >
                       <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="p-8 flex-1 flex flex-col">
                       <div className="flex-1">
                          <h3 className="text-2xl font-black text-zinc-900 tracking-tighter mb-4 truncate group-hover:text-sky-600 transition-colors">
                             {journey.destination}
                          </h3>
                          <div className="flex items-center gap-6 mb-8 text-zinc-400">
                             <div className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-black uppercase tracking-widest">{journey.duration} Cycles</span>
                             </div>
                             <div className="flex items-center gap-2">
                                <Search className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-black uppercase tracking-widest">{journey.budget}</span>
                             </div>
                          </div>
                       </div>
                       
                       <Link to={`/view-trip/${journey._id}`}>
                          <Button className="w-full h-14 bg-zinc-50 hover:bg-zinc-100 text-zinc-900 font-black text-xs uppercase tracking-widest rounded-2xl border border-zinc-100 transition-all flex items-center justify-center gap-2">
                             Inspect Metadata
                             <ArrowRight className="w-4 h-4" />
                          </Button>
                       </Link>
                    </div>
                 </div>
               ))}
             </div>
           ) : (
             <div className="bg-white border-2 border-dashed border-zinc-100 rounded-[48px] p-24 text-center">
                <div className="w-24 h-24 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-8">
                   <Compass className="w-10 h-10 text-zinc-200" />
                </div>
                <h3 className="text-2xl font-black text-zinc-900 tracking-tight mb-2">No active journeys mapped.</h3>
                <p className="text-zinc-400 font-medium italic mb-10 text-sm">Initiate your first geospatial exploration today.</p>
                <Link to="/create-trip">
                  <Button className="bg-zinc-900 text-white font-black px-10 h-16 rounded-2xl uppercase tracking-widest text-xs shadow-xl shadow-zinc-200">
                    Begin Mapping
                  </Button>
                </Link>
             </div>
           )}
        </section>

        {/* Section: Secondary Assignments (Joined) */}
        <section>
           <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-white border border-zinc-100 text-zinc-900 rounded-xl flex items-center justify-center font-black text-xs tracking-widest">
                    SEC
                 </div>
                 <h2 className="text-2xl font-black text-zinc-900 tracking-tight uppercase">Participant Assignments</h2>
              </div>
              <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                 {joinedTrips.length} Sessions
              </div>
           </div>

           {joinedTrips.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {joinedTrips.map((reservation) => (
                  <div key={reservation._id} className="relative group bg-white border border-zinc-100 rounded-[32px] overflow-hidden transition-all hover:shadow-2xl hover:shadow-zinc-200/50 flex flex-col h-full">
                     <div className="absolute top-4 right-4 z-10 bg-zinc-900 text-white px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">
                        {reservation.status}
                     </div>
                     
                     <div className="relative h-48 overflow-hidden bg-zinc-100">
                        <img 
                          src={reservation.hotelImage || reservation.tripId?.tripData?.locationMetrics?.visual || '/placeholder.jpg'}
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale group-hover:grayscale-0"
                        />
                     </div>

                     <div className="p-8 flex-1 flex flex-col">
                        <h3 className="text-xl font-black text-zinc-900 tracking-tighter mb-2 line-clamp-1">
                           {reservation.destination || 'Unresolved Coordinate'}
                        </h3>
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest italic mb-8 italic">
                           {reservation.hotelName}
                        </p>

                        <div className="mt-auto flex flex-col gap-3">
                           {reservation.status === 'approved' && (
                             <Link to={`/chat?tripId=${reservation.tripId?._id || reservation.tripId}`} className="w-full">
                               <Button className="w-full h-14 bg-sky-600 hover:bg-sky-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-sky-100 transition-all flex items-center justify-center gap-2">
                                  Sync Communications
                               </Button>
                             </Link>
                           )}
                           <button 
                             onClick={() => cancelReservation(reservation._id)}
                             className="text-center py-2 text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline decoration-2 underline-offset-4"
                           >
                             Rescind Assignment
                           </button>
                        </div>
                     </div>
                  </div>
                ))}
             </div>
           ) : (
             <div className="bg-zinc-50/50 border border-zinc-100 rounded-[48px] p-16 text-center">
                <p className="text-zinc-400 font-black uppercase tracking-widest text-[11px] mb-6">No active participant sessions recorded.</p>
                <Link to="/explore" className="text-zinc-900 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:gap-4 transition-all">
                   Explore Global Collective <ArrowRight className="w-4 h-4" />
                </Link>
             </div>
           )}
        </section>

        {/* Section: Intelligence Queue (Pending Requests) */}
        {pendingRequests.length > 0 && (
          <section className="bg-zinc-900 rounded-[64px] p-12 md:p-20 text-white relative overflow-hidden">
             <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-sky-500/10 rounded-full blur-[100px]" />
             
             <div className="relative z-10">
                <div className="flex items-center gap-4 mb-16">
                   <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl">
                      <LayoutDashboard className="w-6 h-6 text-sky-400" />
                   </div>
                   <h2 className="text-3xl font-black tracking-tighter uppercase italic">Authorization Queue</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   {pendingRequests.map((request) => (
                      <div key={request._id} className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[32px] hover:bg-white/10 transition-all">
                         <div className="flex justify-between items-start mb-8">
                            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-xl font-black">
                               {request.userId?.username?.[0]?.toUpperCase()}
                            </div>
                            <div className="bg-amber-400 text-zinc-900 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">
                               {request.status}
                            </div>
                         </div>
                         
                         <h4 className="text-xl font-black tracking-tight mb-2">{request.userId?.username}</h4>
                         <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-8">{request.userId?.email}</p>
                         
                         <div className="bg-black/40 rounded-2xl p-6 border border-white/5 mb-8">
                            <div className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30 mb-3">Target Coordinate</div>
                            <div className="text-sm font-black truncate">{request.tripId?.destination}</div>
                            <div className="mt-1 text-[10px] font-medium text-white/50 italic truncate">{request.hotelName}</div>
                         </div>

                         <Link to="/organiser">
                            <Button variant="ghost" className="w-full text-white/80 hover:text-white hover:bg-white/10 font-black text-[10px] uppercase tracking-[0.15em] flex items-center justify-center gap-2">
                               Enter Management Protocol <ArrowRight className="w-3.5 h-3.5" />
                            </Button>
                         </Link>
                      </div>
                   ))}
                </div>
             </div>
          </section>
        )}

      </div>
    </div>
  );
};

export default DashboardPage;
