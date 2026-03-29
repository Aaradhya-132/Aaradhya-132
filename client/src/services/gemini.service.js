import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = import.meta.env.VITE_GOOGLE_GEMINI_AI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Enhanced Geocoding service using OpenStreetMap's Nominatim.
 */
async function resolveLocationCoordinates(query) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`
    );
    const results = await response.json();
    if (results.length > 0) {
      const bestMatch = results[0];
      return {
        lat: parseFloat(bestMatch.lat),
        lng: parseFloat(bestMatch.lon),
        address: bestMatch.display_name,
        category: bestMatch.type,
      };
    }
    throw new Error("Unable to resolve location coordinates.");
  } catch (error) {
    console.error("Geocoding Engine Error:", error);
    throw error;
  }
}

/**
 * Visual Asset procurement using LoremFlickr (Alternative to Unsplash).
 */
async function getVisualAsset(term, city, mode) {
  const contextTags = mode === "accommodation" ? "hotel,resort,inn" : "landmark,attraction,scenery";
  const normalizedQuery = `${term},${city},${contextTags}`.replace(/\s+/g, ",");
  return `https://loremflickr.com/1280/720/${encodeURIComponent(normalizedQuery.toLowerCase())}`;
}

/**
 * Logic-driven Accommodation retrieval using Overpass API (OpenStreetMap).
 */
async function discoverAccommodations(lat, lng, budgetLevel, cityName) {
  try {
    const radius = 6000;
    const overpassQuery = `
      [out:json][timeout:45];
      (
        node["tourism"~"hotel|guest_house|hostel"](around:${radius},${lat},${lng});
        node["amenity"~"hotel"](around:${radius},${lat},${lng});
      );
      out body;
    `;

    const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`);
    const data = await response.json();

    const processingHotels = data.elements.slice(0, 8).map(async (entity) => {
      const name = entity.tags.name || `${cityName} Quality Stay`;
      let street = entity.tags["addr:street"] || "";
      if (entity.tags["addr:city"]) street += `, ${entity.tags["addr:city"]}`;
      
      let priceRate;
      if (budgetLevel === "optimized") priceRate = "$45-$95";
      else if (budgetLevel === "balanced") priceRate = "$110-$240";
      else priceRate = "$350-$750";

      return {
        hotelName: name,
        address: street || `Central ${cityName}`,
        price: `${priceRate} per night`,
        imageUrl: await getVisualAsset(name, cityName, "accommodation"),
        geoCoordinates: { lat: entity.lat, lng: entity.lon },
        rating: (4.1 + Math.random() * 0.7).toFixed(1),
        description: entity.tags.description || `Highly rated stay in ${cityName}`,
        amenities: ["Universal WiFi", "Parking Access", "Complimentary Breakfast"],
      };
    });

    return await Promise.all(processingHotels);
  } catch (error) {
    console.error("Accommodation Discovery Error:", error);
    return [];
  }
}

/**
 * Smart Points of Interest retrieval using Overpass and Wikipedia summaries.
 */
async function discoverPointsOfInterest(lat, lng, cityName) {
  try {
    const radius = 12000;
    const overpassQuery = `
      [out:json][timeout:45];
      (
        node["tourism"~"attraction|museum|viewpoint|castle|zoo"](around:${radius},${lat},${lng});
        node["historic"~"monument|castle|ruins"](around:${radius},${lat},${lng});
        node["leisure"~"park|nature_reserve"](around:${radius},${lat},${lng});
      );
      out body;
    `;

    const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`);
    const data = await response.json();

    const processingPlaces = data.elements.slice(0, 20).map(async (entity) => {
      const name = entity.tags.name || `${cityName} Attraction`;
      let summary = entity.tags.description || "A premier historical and cultural site.";
      const wikipediaRef = entity.tags.wikipedia;

      if (wikipediaRef) {
        try {
          const wikiTitle = wikipediaRef.includes(":") ? wikipediaRef.split(":")[1] : wikipediaRef;
          const wikiResponse = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTitle)}`);
          if (wikiResponse.ok) {
            const wikiData = await wikiResponse.json();
            if (wikiData.extract) summary = wikiData.extract;
          }
        } catch (e) {
             // Silently fail wiki fetch
        }
      }

      return {
        placeName: name,
        details: summary.substring(0, 160) + (summary.length > 160 ? "..." : ""),
        imageUrl: await getVisualAsset(name, cityName, "discovery"),
        geoCoordinates: { lat: entity.lat, lng: entity.lon },
        ticketPricing: (entity.tags.tourism === "museum" || entity.tags.tourism === "zoo") ? "$15-$30" : "Free Entree",
        rating: (4.3 + Math.random() * 0.6).toFixed(1),
        travelTime: `${Math.floor(Math.random() * 20) + 10} min from base`,
        bestTimeToVisit: "09:30 AM - 05:30 PM",
      };
    });

    return await Promise.all(processingPlaces);
  } catch (error) {
    console.error("POI Discovery Error:", error);
    return [];
  }
}

/**
 * Core Intelligence: Constructs a cohesive journey plan using Gemini AI.
 */
export async function constructJourneyPlan(location, duration, financialTier, companionType) {
  try {
    const geoMetrics = await resolveLocationCoordinates(location);
    
    // Parallel discovery for efficiency
    const [stays, sites] = await Promise.all([
      discoverAccommodations(geoMetrics.lat, geoMetrics.lng, financialTier, location),
      discoverPointsOfInterest(geoMetrics.lat, geoMetrics.lng, location),
    ]);

    // Construct Intelligence Prompt
    const logicPrompt = `
      As a world-class travel architect, generate an optimized ${duration}-day journey for ${companionType} visiting ${location} with a ${financialTier} financial posture.
      
      Mandatory Output Schema: Valid JSON Array of Day Objects.
      Constraint: Distributed these ${sites.length} locations logically: ${sites.map(s => s.placeName).join(", ")}.
      
      Target Format:
      [
        {
          "day": 1,
          "objective": "Strategic objective for this cycle",
          "optimalWindow": "Peak operational hours",
          "sites": ["ExactSiteNameA", "ExactSiteNameB"]
        }
      ]
    `;

    const generativeModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const aiResponse = await generativeModel.generateContent(logicPrompt);
    const suggestionStream = JSON.parse(aiResponse.response.text().replace(/```json|```/g, ""));

    const mappedItinerary = suggestionStream.map(dayCycle => ({
      day: dayCycle.day,
      theme: dayCycle.objective,
      places: dayCycle.sites
        .map(siteName => sites.find(s => s.placeName === siteName))
        .filter(Boolean)
    }));

    const destinationVisual = await getVisualAsset(location, location, "landscape");

    return {
      locationMetrics: { ...geoMetrics, visual: destinationVisual },
      accommodations: stays.slice(0, 5),
      itinerary: mappedItinerary,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Journey Generation Pipeline Failed:", error);
    throw error;
  }
}
