import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, Compass, MapPin, ArrowRight } from "lucide-react";
import { Button } from "../../ui/button";

const HeroSection = () => {
  return (
    <section className="relative w-full overflow-hidden bg-white px-4 pt-16 pb-24 md:pt-24 md:pb-32 lg:pt-32 lg:pb-48">
      {/* Dynamic Background Atmosphere */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-200/30 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[5%] right-[-5%] w-[35%] h-[35%] bg-indigo-200/20 rounded-full blur-[100px]" />
        
        {/* Subtle Micro-Grid */}
        <div className="absolute inset-0 opacity-[0.03] [background-image:radial-gradient(#000_1px,transparent_1px)] [background-size:32px_32px]" />
      </div>

      <div className="container relative mx-auto max-w-7xl">
        <div className="flex flex-col items-center text-center">
          
          {/* Feature Badge */}
          <div className="group mb-10 flex items-center gap-2 rounded-full border border-zinc-100 bg-zinc-50/50 px-4 py-1.5 transition-all hover:bg-zinc-100/80">
            <Sparkles className="h-4 w-4 text-sky-500 animate-spin-slow" />
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-600">
              Intelligence built for wanderlust
            </span>
          </div>

          {/* Main Typography */}
          <div className="relative mb-8 max-w-4xl">
            <h1 className="text-5xl font-extrabold tracking-tight text-zinc-900 sm:text-7xl lg:text-8xl">
              Design your journey
              <span className="relative mt-2 block bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
                bound by no limits.
              </span>
            </h1>
            
            <p className="mx-auto mt-10 max-w-2xl text-lg font-medium leading-relaxed text-zinc-500 sm:text-xl">
              Skip the generic guides. Our AI engine crafts hyper-personalized 
              itineraries matching your unique rhythm, budget, and curiosity.
            </p>
          </div>

          {/* Action Center */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <Link to="/create-trip">
              <Button size="lg" className="h-14 rounded-2xl bg-zinc-900 px-10 text-base font-bold text-white shadow-2xl shadow-zinc-200 transition-all hover:scale-105 active:scale-95">
                Start My Itinerary
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            
            <Link to="/explore">
              <Button variant="ghost" size="lg" className="h-14 rounded-2xl px-8 text-base font-bold text-zinc-600 hover:bg-zinc-50">
                Explore Public Trips
              </Button>
            </Link>
          </div>

          {/* Impact Stats */}
          <div className="mt-24 grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-8">
            {[
              { label: "Journeys Mapped", value: "85,000+", icon: MapPin, tone: "text-sky-500" },
              { label: "Global Destinations", value: "190+", icon: Compass, tone: "text-indigo-500" },
              { label: "Approval Rate", value: "99.4%", icon: Sparkles, tone: "text-emerald-500" },
            ].map((stat, i) => (
              <div key={i} className="group relative overflow-hidden rounded-3xl border border-zinc-100 bg-white p-8 transition-all hover:border-zinc-200 hover:shadow-xl hover:shadow-zinc-100">
                <div className={`mb-4 inline-flex rounded-xl bg-zinc-50 p-2.5 ${stat.tone}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="text-3xl font-black text-zinc-900">{stat.value}</div>
                <div className="mt-1 text-sm font-semibold text-zinc-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Deco Element */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce opacity-30">
        <div className="h-12 w-8 rounded-full border-2 border-zinc-200 p-2">
          <div className="mx-auto h-2 w-1.5 rounded-full bg-zinc-300" />
        </div>
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
