import React, { useState, useMemo } from "react";
import { MapPin, Star, Clock, ArrowUpRight, ShieldCheck, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../ui/button";

/**
 * Enhanced Entity Card for displaying Hotels or Attractions with a premium aesthetic.
 */
const EntityCard = ({ data, type = "accommodation", tripId, parentContext }) => {
  const navigate = useNavigate();
  const isHotel = type === "accommodation";

  // Dynamic Asset Generation
  const visualAssets = useMemo(() => {
    const assets = [];
    if (data.imageUrl) assets.push(data.imageUrl);
    
    // Technical fallbacks based on type
    const baseTag = isHotel ? "hotel,luxury" : "landmark,architecture";
    assets.push(`https://loremflickr.com/1280/720/${encodeURIComponent(data.hotelName || data.placeName || 'travel')},${baseTag}`);
    
    return [...new Set(assets)];
  }, [data, isHotel]);

  const [activeAsset, setActiveAsset] = useState(0);

  const navigateToIntelligence = () => {
    navigate("/view-details", {
      state: {
        hotel: data,
        isHotel,
        tripId,
        tripHotelName: parentContext || (isHotel ? data.hotelName : null)
      },
    });
  };

  return (
    <div className="group relative bg-white border border-zinc-100 rounded-[32px] overflow-hidden transition-all hover:shadow-2xl hover:shadow-zinc-200/50 flex flex-col h-full">
      {/* Visual Layer */}
      <div className="relative h-60 overflow-hidden">
        <img
          src={visualAssets[activeAsset]}
          alt={data.hotelName || data.placeName}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Overlay Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/40 via-transparent to-transparent opacity-60" />
        
        {/* Metric Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          <div className="bg-white/90 backdrop-blur-md border border-zinc-100 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
             {isHotel ? <ShieldCheck className="w-3.5 h-3.5 text-sky-600" /> : <Zap className="w-3.5 h-3.5 text-emerald-600" />}
             <span className="text-[10px] font-black uppercase tracking-wider text-zinc-900">
                {isHotel ? "Verified Stay" : "Top Interest"}
             </span>
          </div>
        </div>

        {data.rating && (
          <div className="absolute top-4 right-4 bg-zinc-900/80 backdrop-blur-md px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 border border-white/10 shadow-xl">
            <Star className="w-3 h-3 text-sky-400 fill-sky-400" />
            <span className="text-[11px] font-black text-white">{data.rating}</span>
          </div>
        )}
      </div>

      {/* Logic/Content Layer */}
      <div className="p-7 flex-1 flex flex-col">
        <div className="flex-1">
          <h3 className="text-xl font-black text-zinc-900 tracking-tight mb-2 line-clamp-1 group-hover:text-sky-600 transition-colors">
            {isHotel ? data.hotelName : data.placeName}
          </h3>
          
          <div className="flex items-start gap-2 text-zinc-400 mb-4 h-5">
             <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
             <span className="text-xs font-bold truncate tracking-tight">{data.address || "Coordinates Secured"}</span>
          </div>

          <p className="text-sm font-medium text-zinc-500 leading-relaxed line-clamp-2 mb-6 italic">
            "{isHotel ? data.description : data.details}"
          </p>
        </div>

        {/* Dynamic Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
           <div className="flex flex-col gap-1">
              <span className="text-[9px] font-black text-zinc-300 uppercase tracking-[0.15em]">Financial Index</span>
              <span className="text-sm font-black text-zinc-900">
                 {isHotel ? (data.price || "N/A") : (data.ticketPricing || "Variable")}
              </span>
           </div>
           <div className="flex flex-col gap-1">
              <span className="text-[9px] font-black text-zinc-300 uppercase tracking-[0.15em]">Peak Interval</span>
              <div className="flex items-center gap-1.5">
                 <Clock className="w-3 h-3 text-sky-500" />
                 <span className="text-sm font-black text-zinc-900">
                    {data.bestTimeToVisit || "Optimal"}
                 </span>
              </div>
           </div>
        </div>

        {/* Execution Hub */}
        <Button 
          onClick={navigateToIntelligence}
          className="w-full h-14 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-zinc-200 group-hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
        >
          {isHotel ? "Inspect Stay" : "Sync Itinerary"}
          <ArrowUpRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default EntityCard;
