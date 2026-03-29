import React, { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Send, MessageCircle, LogOut, Lock, ImageIcon, X, Loader2, Sparkles, Hash, Layers, ArrowLeft, MoreVertical } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import apiClient from "../../api/client";
import { Button } from "../../components/ui/button";
import { useToast } from "../../components/ui/toast";

const CommunicationHub = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get("tripId");

  const [activeThread, setActiveThread] = useState(null);
  const [messageStream, setMessageStream] = useState([]);
  const [currentPayload, setCurrentPayload] = useState("");
  const [socketMatrix, setSocketMatrix] = useState(null);
  
  const [pendingAssets, setPendingAssets] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAccessDenied, setIsAccessDenied] = useState(false);
  const [authorizedCollectives, setAuthorizedCollectives] = useState([]);
  const [isMatrixLoading, setIsMatrixLoading] = useState(false);

  const scrollAnchor = useRef(null);
  const assetInput = useRef(null);

  const syncScroll = useCallback(() => {
    scrollAnchor.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    syncScroll();
  }, [messageStream, syncScroll]);

  // Sync Global Collectives (If no tripId selected)
  const fetchAuthorizedCollectives = useCallback(async () => {
    setIsMatrixLoading(true);
    try {
      const response = await apiClient.get("/bookings/user-bookings");
      const approved = response.data.filter(b => b.status === "approved" && b.tripId);
      setAuthorizedCollectives(approved);
    } catch (error) {
       console.error("Collective Retrieval Failure:", error);
    } finally {
       setIsMatrixLoading(false);
    }
  }, []);

  // Socket & History Logic
  useEffect(() => {
    if (!user) return;

    if (!tripId) {
      fetchAuthorizedCollectives();
      return;
    }

    // Extraction Protocol
    const extractHistory = async () => {
       try {
          const response = await apiClient.get(`/messages/${tripId}`);
          const formattedHistory = response.data.map(m => ({
             author: m.username,
             content: m.message,
             type: m.type || "text",
             visualUrl: m.imageUrl || "",
             timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }));
          setMessageStream(formattedHistory);
          setIsAccessDenied(false);
       } catch (error) {
          if (error.response?.status === 403) setIsAccessDenied(true);
       }
    };

    extractHistory();

    // Socket Initialization
    const socketEndpoint = import.meta.env.PROD ? window.location.origin : "http://localhost:5001";
    const socketInstance = io(socketEndpoint, { withCredentials: true });

    socketInstance.on("connect", () => {
       socketInstance.emit("join_chat", { tripId });
    });

    socketInstance.on("receive_message", (data) => {
       setMessageStream(prev => [...prev, {
          author: data.author,
          content: data.message,
          type: data.type,
          visualUrl: data.imageUrl,
          timestamp: data.time
       }]);
    });

    setSocketMatrix(socketInstance);

    return () => {
       socketInstance.disconnect();
    };
  }, [user, tripId, fetchAuthorizedCollectives]);

  const transmitPayload = async () => {
    if ((currentPayload.trim() || pendingAssets) && socketMatrix && tripId) {
      setIsSyncing(true);
      
      const packet = {
         tripId,
         author: user.username,
         message: currentPayload.trim(),
         type: pendingAssets ? "image" : "text",
         imageUrl: pendingAssets || "",
         time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      socketMatrix.emit("send_message", packet);
      
      setCurrentPayload("");
      setPendingAssets(null);
      setIsSyncing(false);
    }
  };

  const handleAssetSelection = (e) => {
    const asset = e.target.files[0];
    if (asset) {
       const reader = new FileReader();
       reader.onloadend = () => setPendingAssets(reader.result);
       reader.readAsDataURL(asset);
    }
  };

  if (!user) return null;

  if (isAccessDenied) return (
     <div className="min-h-screen bg-white flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-zinc-50 border border-zinc-100 p-12 rounded-[48px] text-center shadow-2xl shadow-zinc-100">
           <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <Lock className="w-10 h-10 text-rose-500" />
           </div>
           <h2 className="text-3xl font-black text-zinc-900 tracking-tighter uppercase italic">Access Restricted</h2>
           <p className="mt-4 text-sm font-medium text-zinc-400 italic mb-10">You have no authorized presence in this collective matrix.</p>
           <Link to="/explore">
              <Button className="w-full h-14 bg-zinc-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest">Return to Base</Button>
           </Link>
        </div>
     </div>
  );

  return (
    <div className="min-h-[calc(100vh-64px)] bg-zinc-50/20 md:p-10 selection:bg-zinc-900 selection:text-white">
      <div className="max-w-7xl mx-auto h-[80vh] bg-white rounded-[56px] border border-zinc-100 shadow-2xl shadow-zinc-200/50 overflow-hidden flex flex-col md:flex-row">
        
        {/* Collective Selection Sidebar */}
        <div className="w-full md:w-96 border-r border-zinc-50 bg-white flex flex-col shrink-0">
           <div className="p-10 border-b border-zinc-50">
              <div className="flex items-center gap-3 mb-2">
                 <div className="w-8 h-1 bg-zinc-900 rounded-full" />
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Hub Monitor</span>
              </div>
              <h2 className="text-3xl font-black text-zinc-900 tracking-tighter italic uppercase">Collectives.</h2>
           </div>

           <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {isMatrixLoading ? (
                 <div className="py-20 flex flex-col items-center gap-4 animate-pulse">
                    <div className="w-10 h-10 bg-zinc-50 rounded-xl" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-300">Syncing Matrix...</span>
                 </div>
              ) : authorizedCollectives.length > 0 ? (
                 authorizedCollectives.map(c => (
                    <button
                      key={c._id}
                      onClick={() => navigate(`/chat?tripId=${c.tripId?._id || c.tripId}`)}
                      className={`w-full p-4 rounded-3xl flex items-center gap-5 transition-all text-left group
                        ${tripId === (c.tripId?._id || c.tripId) ? "bg-zinc-900 text-white shadow-xl shadow-zinc-200 scale-[1.02]" : "hover:bg-zinc-50"}`}
                    >
                       <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 border-2 border-white/10 group-hover:scale-105 transition-transform">
                          <img src={c.hotelImage || '/placeholder.jpg'} className={`w-full h-full object-cover ${tripId === (c.tripId?._id || c.tripId) ? "" : "grayscale"}`} />
                       </div>
                       <div className="flex-1 min-w-0">
                          <h4 className={`text-sm font-black truncate uppercase tracking-tight ${tripId === (c.tripId?._id || c.tripId) ? "text-white" : "text-zinc-900"}`}>{c.destination}</h4>
                          <p className={`text-[10px] font-medium truncate italic ${tripId === (c.tripId?._id || c.tripId) ? "text-white/40" : "text-zinc-400"}`}>{c.hotelName || "Collective Access"}</p>
                       </div>
                       {tripId === (c.tripId?._id || c.tripId) && <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />}
                    </button>
                 ))
              ) : (
                 <div className="py-12 px-8 text-center bg-zinc-50/50 rounded-[40px] italic">
                    <MessageCircle className="w-10 h-10 text-zinc-100 mx-auto mb-6" />
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">No Active Collective Presence Found.</p>
                 </div>
              )}
           </div>
        </div>

        {/* Dynamic Communication Stream */}
        <div className="flex-1 flex flex-col bg-zinc-50/30">
           {tripId ? (
              <>
                 {/* Hub Header */}
                 <div className="p-8 px-10 border-b border-zinc-100 bg-white flex items-center justify-between">
                    <div className="flex items-center gap-5">
                       <div className="w-14 h-14 bg-zinc-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-zinc-200">
                          <Hash className="w-6 h-6" />
                       </div>
                       <div>
                          <h3 className="text-xl font-black text-zinc-900 tracking-tight uppercase italic">{authorizedCollectives.find(c => (c.tripId?._id || c.tripId) === tripId)?.destination || "COMM_STREAM_01"}</h3>
                          <div className="flex items-center gap-2 mt-1">
                             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                             <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Sync Active</span>
                          </div>
                       </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <Button variant="ghost" size="icon" className="text-zinc-400 hover:bg-zinc-100 rounded-xl w-12 h-12"><MoreVertical className="w-5 h-5" /></Button>
                    </div>
                 </div>

                 {/* Message Matrix */}
                 <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
                    {messageStream.map((packet, idx) => {
                       const isIdentityUser = packet.author === user.username;
                       return (
                          <div key={idx} className={`flex ${isIdentityUser ? "justify-end" : "justify-start"}`}>
                             <div className={`flex flex-col gap-2 max-w-[75%] ${isIdentityUser ? "items-end" : "items-start"}`}>
                                <div className={`flex items-end gap-4 ${isIdentityUser ? "flex-row-reverse" : "flex-row"}`}>
                                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black border transition-all ${isIdentityUser ? "bg-white text-zinc-900 border-zinc-100" : "bg-zinc-900 text-white border-zinc-900"}`}>
                                      {packet.author?.[0]?.toUpperCase() || "X"}
                                   </div>
                                   <div className={`p-5 rounded-[28px] shadow-sm transform transition-all hover:scale-[1.01] ${isIdentityUser ? "bg-zinc-900 text-white rounded-tr-none" : "bg-white text-zinc-900 border border-zinc-100 rounded-tl-none"}`}>
                                      {packet.type === "image" ? (
                                         <img src={packet.visualUrl} className="max-h-80 rounded-2xl cursor-zoom-in hover:opacity-90 transition-all border border-white/10" onClick={() => window.open(packet.visualUrl, '_blank')} />
                                      ) : (
                                         <p className="text-sm font-bold leading-relaxed tracking-tight">{packet.content}</p>
                                      )}
                                   </div>
                                </div>
                                <div className="flex items-center gap-3 px-1">
                                   <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-300">{packet.author}</span>
                                   <span className="text-[8px] font-medium text-zinc-200">[{packet.timestamp}]</span>
                                </div>
                             </div>
                          </div>
                       );
                    })}
                    <div ref={scrollAnchor} />
                 </div>

                 {/* Transmission Controller */}
                 <div className="p-8 px-10 bg-white border-t border-zinc-100">
                    {pendingAssets && (
                       <div className="mb-6 p-3 bg-zinc-50 border border-zinc-100 rounded-2xl flex items-center justify-between animate-in slide-in-from-bottom duration-300">
                          <div className="flex items-center gap-4">
                             <img src={pendingAssets} className="w-14 h-14 object-cover rounded-xl border border-white shadow-xl" />
                             <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900 italic">Visual Hash Staged</span>
                          </div>
                          <button onClick={() => setPendingAssets(null)} className="p-2 hover:bg-zinc-100 rounded-xl transition-all text-zinc-400 hover:text-rose-500"><X className="w-5 h-5" /></button>
                       </div>
                    )}
                    <div className="flex gap-4 items-center">
                       <button onClick={() => assetInput.current?.click()} className="w-16 h-16 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all shadow-sm">
                          <ImageIcon className="w-6 h-6" />
                       </button>
                       <input type="file" ref={assetInput} className="hidden" accept="image/*" onChange={handleAssetSelection} />
                       
                       <div className="flex-1 relative">
                          <input 
                             type="text" 
                             value={currentPayload}
                             placeholder={pendingAssets ? "Append transmission metadata..." : "Input communication sequence..."}
                             onChange={(e) => setCurrentPayload(e.target.value)}
                             onKeyPress={(e) => e.key === 'Enter' && transmitPayload()}
                             className="w-full h-16 px-8 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-bold text-zinc-900 focus:outline-none focus:ring-4 focus:ring-sky-500/10 transition-all placeholder:text-zinc-300"
                          />
                       </div>

                       <Button onClick={transmitPayload} disabled={isSyncing} className="h-16 w-16 bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl shadow-xl shadow-zinc-200 transition-all active:scale-95 flex items-center justify-center shrink-0">
                          {isSyncing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-5 h-5" />}
                       </Button>
                    </div>
                 </div>
              </>
           ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-20 text-center animate-in fade-in duration-1000">
                 <div className="w-32 h-32 bg-zinc-50 rounded-[48px] flex items-center justify-center mb-10 border border-zinc-100">
                    <Layers className="w-12 h-12 text-zinc-100" />
                 </div>
                 <h2 className="text-4xl font-black text-zinc-900 tracking-tighter uppercase italic">Neutral Core.</h2>
                 <p className="mt-6 text-sm font-medium text-zinc-400 italic max-w-sm">No collective thread currently resolved. Select a monitoring station from the lateral matrix to begin synchronization.</p>
                 <Link to="/explore" className="mt-12">
                    <Button variant="outline" className="border-2 border-zinc-100 rounded-2xl px-8 h-12 font-black text-[10px] uppercase tracking-widest text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all">Explore Global Collective</Button>
                 </Link>
              </div>
           )}
        </div>

      </div>
    </div>
  );
};

export default CommunicationHub;
