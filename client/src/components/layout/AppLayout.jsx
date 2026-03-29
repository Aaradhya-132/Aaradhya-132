import React from "react";
import { Outlet, ScrollRestoration } from "react-router-dom";
import Navbar from "./Navbar";

/**
 * Standard Application Layout wrapping all routes for consistent global elements.
 */
const AppLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50/50 selection:bg-zinc-900 selection:text-white antialiased font-sans">
      {/* Navigation Layer */}
      <Navbar />

      {/* Main Content Layer */}
      <main className="flex-1 w-full max-w-screen-2xl mx-auto py-0 md:py-0 pb-16 md:pb-0 transition-opacity animate-in fade-in duration-500">
        <Outlet />
      </main>

      {/* Persistence and Utilities */}
      <ScrollRestoration />

      {/* Optional: Generic Footer Layer can be added here */}
    </div>
  );
};

export default AppLayout;
