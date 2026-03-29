import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Calendar, MapPin, Check, Boxes, ChevronRight } from "lucide-react";

import NominatimAutocomplete from "../../components/NominatimAutocomplete";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { useToast } from "../../components/ui/toast";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../api/client";
import { constructJourneyPlan } from "../../services/gemini.service";
import TravelLoader from "../../components/custom/TravelLoader";
import { companionProfiles, financialTiers, JOURNEY_CONSTRAINTS } from "../../data/journey-presets";

const PlanJourneyPage = () => {
  const [selectedTier, setSelectedTier] = useState(null);
  const [selectedCompanion, setSelectedCompanion] = useState(null);
  const [journeyParams, setJourneyParams] = useState({
    location: null,
    duration: 1,
    isLeadRequest: false,
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const updateParameter = (key, val) => {
    setJourneyParams((prev) => ({ ...prev, [key]: val }));
  };

  const executeJourneyGeneration = async () => {
    if (!user) {
      toast({
        title: "Authorization Required",
        description: "Please initialize your identity to generate a journey.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    // Validation Logic
    const { location, duration, isLeadRequest } = journeyParams;
    const isValid = 
      location && 
      selectedTier && 
      selectedCompanion && 
      duration >= JOURNEY_CONSTRAINTS.MIN_DURATION && 
      duration <= JOURNEY_CONSTRAINTS.MAX_DURATION;

    if (!isValid) {
      toast({
        title: "Parameters Incomplete",
        description: `Ensure destination, budget, companion, and duration (${JOURNEY_CONSTRAINTS.MIN_DURATION}-${JOURNEY_CONSTRAINTS.MAX_DURATION} days) are defined.`,
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const destinationLabel = location.display_name || location.label || "Target Destination";
      
      // Compute Journey using Gemini Intelligence
      const journeyResult = await constructJourneyPlan(
        destinationLabel,
        duration,
        selectedTier.label,
        selectedCompanion.label
      );

      // Persistence Logic: Store in Hive (Server)
      const persistencePayload = {
        destination: destinationLabel,
        tripData: journeyResult,
        duration,
        budget: selectedTier.label,
        requestOrganiser: isLeadRequest,
      };

      const result = await apiClient.post("/trips", persistencePayload);
      
      toast({
        title: "Mapping Complete",
        description: "Your custom adventure has been successfully rendered.",
      });

      navigate(`/view-trip/${result.data._id}`);
    } catch (error) {
      console.error("Journey Generation Pipeline Error:", error);
      toast({
        title: "Intelligence Failure",
        description: "The AI core encountered a bottleneck. Please verify your parameters and retry.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] w-full max-w-7xl mx-auto px-6 py-16 md:py-24 selection:bg-zinc-900 selection:text-white">
      {isProcessing && <TravelLoader />}

      <div className="flex flex-col gap-20">
        {/* Prime Directive (Header) */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <div className="bg-sky-50 text-sky-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 border border-sky-100 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            Intelligence-Driven Mapping
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-zinc-900 tracking-tighter leading-[0.9]">
            Define your world <br />
            <span className="text-zinc-400">coordinates.</span>
          </h1>
          <p className="mt-8 text-lg font-medium text-zinc-400 leading-relaxed max-w-2xl italic">
            "Every mile is a metric of curiosity. Input your parameters and let our neural networks design your ultimate traversal."
          </p>
        </div>

        {/* Dynamic Form Controller */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Section 01: Destination Matrix */}
          <div className="lg:col-span-12 group">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-zinc-900 text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-xl shadow-zinc-200">
                 01
              </div>
              <div>
                <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Geospatial Target</h2>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Select your primary destination</p>
              </div>
            </div>
            
            <div className="bg-white border border-zinc-100 p-2 rounded-3xl shadow-2xl shadow-zinc-100 transition-all focus-within:ring-4 focus-within:ring-sky-500/10 focus-within:border-sky-500/30">
               <NominatimAutocomplete
                  onChange={(val) => updateParameter("location", val)}
               />
            </div>
          </div>

          {/* Section 02: Temporal Interval */}
          <div className="lg:col-span-4 group">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 bg-zinc-100 text-zinc-900 rounded-xl flex items-center justify-center font-bold text-sm">
                 02
              </div>
              <h3 className="text-lg font-black text-zinc-900 tracking-tight">Temporal Duration</h3>
            </div>
            <div className="relative">
              <Input
                type="number"
                min={1}
                max={7}
                placeholder="Ex: 4"
                value={journeyParams.duration}
                onChange={(e) => updateParameter("duration", parseInt(e.target.value) || 1)}
                className="h-16 px-6 bg-white border-zinc-100 rounded-2xl text-lg font-black tracking-tight focus:ring-sky-500/10"
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-black text-zinc-300 uppercase tracking-widest">
                 Days
              </div>
            </div>
          </div>

          {/* Section 03: Financial Tier */}
          <div className="lg:col-span-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 bg-zinc-100 text-zinc-900 rounded-xl flex items-center justify-center font-bold text-sm">
                 03
              </div>
              <h3 className="text-lg font-black text-zinc-900 tracking-tight">Financial Posture</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               {financialTiers.map((tier) => (
                  <button
                    key={tier.key}
                    onClick={() => setSelectedTier(tier)}
                    className={`group relative flex flex-col items-start p-6 rounded-3xl border-2 transition-all text-left
                      ${selectedTier?.key === tier.key 
                        ? "border-zinc-900 bg-white" 
                        : "border-zinc-50 bg-zinc-50/30 hover:bg-white hover:border-zinc-200"}`}
                  >
                    <div className="text-2xl mb-4 opacity-40 group-hover:scale-110 transition-transform">{tier.indicator}</div>
                    <div className="text-sm font-black text-zinc-900 uppercase tracking-tighter mb-1">{tier.label}</div>
                    <div className="text-[10px] font-bold text-zinc-400 leading-tight uppercase tracking-widest">{tier.summary}</div>
                    {selectedTier?.key === tier.key && <div className="absolute top-4 right-4 text-zinc-900"><Check className="w-5 h-5" /></div>}
                  </button>
               ))}
            </div>
          </div>

          {/* Section 04: Social Composition */}
          <div className="lg:col-span-12">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 bg-zinc-100 text-zinc-900 rounded-xl flex items-center justify-center font-bold text-sm">
                 04
              </div>
              <h3 className="text-lg font-black text-zinc-900 tracking-tight">Social Composition</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               {companionProfiles.map((companion) => (
                  <button
                    key={companion.key}
                    onClick={() => setSelectedCompanion(companion)}
                    className={`group relative flex flex-col items-center p-8 rounded-3xl border-2 transition-all text-center
                      ${selectedCompanion?.key === companion.key 
                        ? "border-zinc-900 bg-white" 
                        : "border-zinc-50 bg-zinc-50/30 hover:bg-white hover:border-zinc-200"}`}
                  >
                    <div className="text-4xl mb-6 grayscale group-hover:grayscale-0 transition-all">{companion.avatar}</div>
                    <div className="text-xs font-black text-zinc-900 uppercase tracking-widest mb-2">{companion.label}</div>
                    <div className="text-[10px] font-medium text-zinc-400 italic">{companion.summary}</div>
                    {selectedCompanion?.key === companion.key && <div className="absolute top-4 right-4 text-zinc-900"><Check className="w-5 h-5" /></div>}
                  </button>
               ))}
            </div>
          </div>

          {/* Section 05: Lead Protocol */}
          <div className="lg:col-span-12 bg-sky-50/30 border border-sky-100/50 p-10 rounded-[40px] flex flex-col md:flex-row items-center gap-8 md:gap-16">
             <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-10 h-10 bg-sky-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-sky-200">
                      <Boxes className="w-5 h-5" />
                   </div>
                   <h4 className="text-xl font-black text-zinc-900 tracking-tight">Leadership Protocol</h4>
                </div>
                <p className="text-sm font-medium text-zinc-500 max-w-xl leading-relaxed">
                   "Would you like to authorize as the Primary Lead? This grants group oversight, message moderation, and participant approval privileges."
                </p>
             </div>
             <label className="flex items-center gap-6 px-8 py-5 bg-white rounded-2xl border border-sky-100 shadow-xl shadow-sky-100/50 cursor-pointer active:scale-95 transition-all">
                <input 
                  type="checkbox" 
                  className="w-6 h-6 rounded-lg border-zinc-200 text-sky-600 focus:ring-sky-500 transition-all"
                  checked={journeyParams.isLeadRequest}
                  onChange={(e) => updateParameter("isLeadRequest", e.target.checked)}
                />
                <span className="text-xs font-black uppercase tracking-widest text-zinc-700">Authorize Lead Role</span>
             </label>
          </div>

          {/* Execution Layer */}
          <div className="lg:col-span-12 flex justify-end items-center pt-8">
             <Button
                onClick={executeJourneyGeneration}
                disabled={isProcessing}
                className="h-20 px-12 bg-zinc-900 hover:bg-zinc-800 text-white font-black text-lg uppercase tracking-widest rounded-[28px] shadow-2xl shadow-zinc-200 active:scale-95 transition-all flex items-center gap-4"
             >
                {isProcessing ? "Processing neural path..." : "Initiate Itinerary Generation"}
                <ChevronRight className="w-6 h-6" />
             </Button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PlanJourneyPage;
