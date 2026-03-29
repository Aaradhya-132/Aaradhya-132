import React from "react";
import HeroSection from "./components/features/home/HeroSection";

/**
 * Root Application Entry Component for the Landing Page.
 * Renders the primary HeroSection with contemporary AI-driven branding.
 */
const App = () => {
  return (
    <div className="flex flex-col w-full">
      {/* Prime Interaction Section */}
      <HeroSection />

      {/* Additional sections such as Features and Social Proof can be added here */}
    </div>
  );
};

export default App;
