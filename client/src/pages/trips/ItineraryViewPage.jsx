import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  MapPin, Star, Clock, Calendar, Users, ShieldCheck, 
  MessageCircle, Share2, ArrowLeft, ChevronRight, 
  Layers, Zap, Map, Info, Compass
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import apiClient from "../../api/client";
import { useToast } from "../../components/ui/toast";
import EntityCard from "../../components/features/trips/EntityCard";
import { Button } from "../../components/ui/button";

const ItineraryViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [journeyData, setJourneyData] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [membershipStatus, setMembershipStatus] = useState("unauthorized"); // unauthorized, pending, authorized
  const [participants, setParticipants] = useState([]);
  const [activeSegment, setActiveSegment] = useState(null);

  const fetchJourneyIntelligence = useCallback(async () => {
    if (!id) return;
    try {
      const response = await apiClient.get(`/trips/${id}`);
      const tripObj = response.data;
      
      setJourneyData({
        ...tripObj.tripData,
        _id: tripObj._id,
        destination: tripObj.destination,
        author: tripObj.author,
        duration: tripObj.duration,
        budget: tripObj.budget,
        isLead: tripObj.requestOrganiser
      });

      // Fetch participants simultaneously
      const participantsResponse = await apiClient.get(`/bookings/trip/${id}/members`);
      setParticipants(participantsResponse.data);

      if (user) {
        const statusResponse = await apiClient.get(`/bookings/status/${encodeURIComponent(tripObj.destination)}`);
        if (statusResponse.data) {
          setMembershipStatus(statusResponse.data.status || "unauthorized");
        }
      }
    } catch (error) {
       console.error("Intelligence Retrieval Failed:", error);
       toast({ title: "Retrieval Error", description: "The journey coordinates could not be resolved.", variant: "destructive" });
    } finally {
       setSessionLoading(false);
    }
  }, [id, user, toast]);

  useEffect(() => {
    fetchJourneyIntelligence();
  }, [fetchJourneyIntelligence]);

  const initiateJoinProtocol = async () => {
    if (!user) {
      toast({ title: "Identity Required", description: "You must authorize your identity to join this collective." });
      navigate("/login");
      return;
    }
    
    try {
      await apiClient.post("/bookings/join", {
        destination: journeyData.destination,
        tripId: id
      });
      setMembershipStatus("pending");
      toast({ title: "Protocol Initiated", description: "Your membership request has been queued for validation." });
    } catch (error) {
      toast({ title: "Authorization Denied", description: error.message || "Unable to join collective.", variant: "destructive" });
    }
  };

  const copyCoordLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Coordinates Copied", description: "The manual link has been stored in your buffer." });
  };

  if (sessionLoading) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 animate-pulse">
       <div className="w-16 h-16 bg-zinc-900 rounded-3xl" />
       <div className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Resolving Itinerary Space...</div>
    </div>
  );

  if (!journeyData) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-12 text-center">
       <Compass className="w-20 h-20 text-zinc-100 mb-8" />
       <h2 className="text-3xl font-black text-zinc-900 tracking-tight">Coordinate Mismatch</h2>
       <p className="mt-4 text-zinc-400 italic">The requested journey does not exist in our collective archive.</p>
       <Link to="/explore" className="mt-10">
          <Button className="bg-zinc-900 h-14 px-8 rounded-2xl font-black text-xs uppercase tracking-widest">Return to Exploration</Button>
       </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Immersive Header Layer */}
      <div className="relative h-[50vh] w-full overflow-hidden bg-zinc-900">
         <img 
            src={journeyData.locationMetrics?.visual || "/placeholder.jpg"} 
            className="w-full h-full object-cover opacity-60 scale-105"
         />
         <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
         
         {/* Navigation Control */}
         <div className="absolute top-10 left-10 flex gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/10"
            >
               <ArrowLeft className="w-5 h-5" />
            </button>
         </div>

         <div className="absolute top-10 right-10 flex gap-4">
            <button 
              onClick={copyCoordLink}
              className="px-6 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white gap-2 hover:bg-white/20 transition-all border border-white/10 text-xs font-black uppercase tracking-widest"
            >
               <Share2 className="w-4 h-4" />
               Share
            </button>
         </div>

         {/* Title Composition */}
         <div className="absolute bottom-20 left-10 md:left-24 max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
               <div className="bg-sky-500 w-10 h-1 rounded-full" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Itinerary Profile</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black text-zinc-900 tracking-tighter leading-none">
               {journeyData.destination}
            </h1>
            <div className="flex flex-wrap items-center gap-8 mt-10">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center text-white">
                     <Clock className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-zinc-900">{journeyData.duration} Days</span>
               </div>
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center text-white text-[10px] font-black italic">
                     $$
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-zinc-900">{journeyData.budget}</span>
               </div>
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center text-white">
                     <Star className="w-4 h-4 text-sky-400" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-zinc-900">Premium Itinerary</span>
               </div>
            </div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-24 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-24">
          
          {/* Main Content Stream (Itinerary) */}
          <div className="lg:col-span-8 space-y-32">
            
            {/* Section: Accommodation Matrix */}
            <section>
              <div className="flex items-center gap-4 mb-12">
                 <div className="w-10 h-10 bg-zinc-900 text-white rounded-xl flex items-center justify-center">
                    <Layers className="w-5 h-5" />
                 </div>
                 <h2 className="text-3xl font-black tracking-tight text-zinc-900 uppercase italic">Base Accommodations</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                 {journeyData.accommodations?.slice(0, 4).map((stay, idx) => (
                    <EntityCard key={idx} data={stay} type="accommodation" tripId={journeyData._id} />
                 ))}
              </div>
            </section>

            {/* Section: Timeline Execution */}
            <section>
              <div className="flex items-center gap-4 mb-20">
                 <div className="w-10 h-10 bg-zinc-900 text-white rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                 </div>
                 <h2 className="text-3xl font-black tracking-tight text-zinc-900 uppercase italic">Temporal Timeline</h2>
              </div>
              
              <div className="relative border-l-2 border-zinc-50 ml-6 space-y-24">
                 {journeyData.itinerary?.map((dayCycle, cycleIdx) => (
                    <div key={cycleIdx} className="relative pl-16">
                       <div className="absolute -left-3 top-0 w-6 h-6 bg-white border-4 border-zinc-900 rounded-full shadow-lg" />
                       
                       <div className="flex flex-col gap-1 mb-8">
                          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Day {dayCycle.day}</span>
                          <h3 className="text-3xl font-black text-zinc-900 tracking-tighter uppercase italic">{dayCycle.theme}</h3>
                       </div>

                       <div className="grid grid-cols-1 gap-8">
                          {dayCycle.places?.map((site, siteIdx) => (
                             <div key={siteIdx} className="group relative bg-white border border-zinc-100 rounded-[32px] p-8 hover:shadow-xl transition-all flex flex-col md:flex-row gap-8">
                                <div className="w-full md:w-48 h-48 rounded-2xl overflow-hidden bg-zinc-50 shrink-0">
                                   <img src={site.imageUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                                </div>
                                <div className="flex-1">
                                   <div className="flex justify-between items-start mb-4">
                                      <h4 className="text-xl font-black text-zinc-900 tracking-tight uppercase group-hover:text-sky-600 transition-colors">{site.placeName}</h4>
                                      <div className="flex items-center gap-1.5 opacity-40">
                                         <Star className="w-3.5 h-3.5 text-sky-500 fill-sky-500" />
                                         <span className="text-xs font-black">{site.rating}</span>
                                      </div>
                                   </div>
                                   <p className="text-sm font-medium text-zinc-500 leading-relaxed mb-8 italic">"{site.details}"</p>
                                   
                                   <div className="flex flex-wrap items-center gap-6">
                                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                         <Clock className="w-3.5 h-3.5" />
                                         {site.bestTimeToVisit}
                                      </div>
                                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500">
                                         <Zap className="w-3.5 h-3.5" />
                                         {site.ticketPricing}
                                      </div>
                                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                         <MapPin className="w-3.5 h-3.5" />
                                         {site.travelTime}
                                      </div>
                                   </div>
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                 ))}
              </div>
            </section>

          </div>

          {/* Lateral Sidebar (Intelligence Hub) */}
          <div className="lg:col-span-4 space-y-12">
             <div className="sticky top-10 space-y-12">
                
                {/* Membership Execution Card */}
                <div className="bg-zinc-900 rounded-[48px] p-10 text-white relative overflow-hidden shadow-2xl shadow-zinc-200">
                   <div className="absolute top-[-10%] left-[-10%] w-60 h-60 bg-sky-500/10 rounded-full blur-[80px]" />
                   
                   <div className="relative z-10 flex flex-col gap-10">
                      <div>
                         <h3 className="text-2xl font-black tracking-tight uppercase italic mb-2">Protocol Access</h3>
                         <p className="text-xs font-medium text-white/40 leading-relaxed">Status: {membershipStatus.toUpperCase()}</p>
                      </div>

                      <div className="space-y-4">
                         {membershipStatus === "unauthorized" && (
                            <Button 
                              onClick={initiateJoinProtocol}
                              className="w-full h-16 bg-white text-zinc-900 hover:bg-zinc-100 font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-2xl transition-all active:scale-95"
                            >
                               Initiate Join Protocol
                            </Button>
                         )}
                         {membershipStatus === "pending" && (
                            <div className="w-full h-16 bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center gap-3">
                               <Clock className="w-4 h-4 text-sky-400 animate-pulse" />
                               <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Awaiting Validator</span>
                            </div>
                         )}
                         {membershipStatus === "approved" && (
                            <div className="space-y-4">
                               <div className="w-16 h-1 bg-sky-500 rounded-full mb-6" />
                               <Link to={`/chat?tripId=${id}`} className="w-full">
                                  <Button className="w-full h-16 bg-sky-600 hover:bg-sky-700 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3">
                                     <MessageCircle className="w-5 h-5" />
                                     Collective Comms
                                  </Button>
                               </Link>
                            </div>
                         )}
                      </div>

                      <div className="pt-8 border-t border-white/5">
                        <div className="flex items-center gap-3 mb-6">
                           <Users className="w-4 h-4 text-zinc-500" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Collective Members ({participants.length})</span>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {participants.map((m, idx) => (
                               <div key={idx} className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-[10px] font-black hover:bg-white/10 transition-all cursor-default" title={m.userId?.username}>
                                  {m.userId?.username?.[0]?.toUpperCase()}
                               </div>
                            ))}
                            {participants.length === 0 && (
                               <span className="text-[10px] font-bold italic text-zinc-600">Zero active members in matrix.</span>
                            )}
                        </div>
                      </div>
                   </div>
                </div>

                {/* Technical Overview Card */}
                <div className="bg-white border border-zinc-100 rounded-[40px] p-10">
                   <div className="flex items-center gap-3 mb-10">
                      <div className="w-1 h-8 bg-zinc-900 rounded-full" />
                      <h4 className="text-lg font-black text-zinc-900 tracking-tight italic uppercase">Technical Metrics</h4>
                   </div>
                   
                   <div className="space-y-8">
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Temporal Unit</span>
                         <span className="text-sm font-black text-zinc-900">{journeyData.duration} Cycles</span>
                      </div>
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Financial index</span>
                         <span className="text-sm font-black text-zinc-900">{journeyData.budget} Level</span>
                      </div>
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Author Identity</span>
                         <span className="text-sm font-black text-zinc-900">Entity_{journeyData.author?.username?.[0] || 'X'}</span>
                      </div>
                   </div>
                </div>

                <div className="p-10 border border-zinc-50 rounded-[40px] text-center">
                   <p className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.2em] mb-6 animate-pulse">Neural Plan Verified</p>
                   <Button variant="ghost" onClick={() => window.print()} className="text-zinc-400 hover:text-zinc-900 text-[10px] font-black uppercase tracking-[0.1em]">
                      Export Coordinate Log
                   </Button>
                </div>
                
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ItineraryViewPage;
