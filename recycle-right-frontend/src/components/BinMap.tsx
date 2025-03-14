import React, { RefObject, useEffect, useRef, useState } from "react";
import mapboxgl, { LngLatLike, Marker } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import styled from "styled-components";
import { Coords } from "./ChatInterface";

// Define a known working Mapbox token as fallback
// This is a security tradeoff but ensures the map can still function if backend fails
const FALLBACK_MAPBOX_TOKEN = "pk.eyJ1IjoieW9qZXJyeSIsImEiOiJjamRsZGZzaDYwNW52MnhxaGVta25pbWM5In0.23w4XcxSUUyeK263dtTOtg";

const MapContainer = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
  margin: 0 auto; /* Center the map */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
`;

const LegendContainer = styled.div`
  position: absolute;
  bottom: 20px;
  left: 20px;
  background-color: white;
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 5;
  font-size: 14px; /* Slightly larger font for mobile */
  max-width: 80%;

  @media (max-width: 480px) {
    bottom: 25px;
    left: 50%;
    transform: translateX(-50%);
    width: 90%;
    max-width: 300px;
  }
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  padding: 3px 0;
`;

const LegendColor = styled.div<{ color: string }>`
  width: 20px; /* Larger for better visibility and touch */
  height: 20px; /* Larger for better visibility and touch */
  background-color: ${(props) => props.color};
  margin-right: 10px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.1);
`;

// Info button to toggle legend on mobile
const InfoButton = styled.button`
  position: absolute;
  bottom: 20px;
  right: 20px;
  background-color: white;
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  cursor: pointer;
  z-index: 5;

  @media (min-width: 481px) {
    display: none; /* Only show on mobile */
  }
`;

// Define bin type for type safety
interface RecyclingBin {
  lng: number;
  lat: number;
  name: string;
  type: "general" | "electronic" | "paper" | "comprehensive";
  accepts: string[];
  collectionTimes: string;
}

// Define colors for different bin types
const binColors: Record<RecyclingBin["type"], string> = {
  general: "#4CAF50", // Green
  electronic: "#FF9800", // Orange
  paper: "#2196F3", // Blue
  comprehensive: "#9C27B0", // Purple
};

interface BinMapProps {
  onClose: () => void;
  currentLocation?: Coords | null;
  destinationLocation?: Coords | null;
  mapboxToken: string | null;
}

const BinMap: React.FC<BinMapProps> = ({
  onClose,
  currentLocation,
  destinationLocation,
  mapboxToken,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLegend, setShowLegend] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const watchId = useRef<number | null>(null);

  // Default Singapore center coordinates
  const defaultCenter: LngLatLike = { lng: 103.8198, lat: 1.3521 };

  const getWalkingRoute = async (start: Coords, end: Coords) => {
    if (!mapboxgl.accessToken) {
      console.error("Cannot get walking route: Mapbox token not set");
      return;
    }
    
    try {
      const query = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/walking/${start.lng},${start.lat};${end.lng},${end.lat}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`
      );
      
      if (!query.ok) {
        throw new Error(`Mapbox API request failed with status: ${query.status}`);
      }
      
      const json = await query.json();
      
      if (!json.routes || json.routes.length === 0) {
        console.error("No route found between the specified points");
        return;
      }
      
      const data = json.routes[0];
      const route = data.geometry.coordinates;
      const geojson = {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: route,
        },
      };

      if (map.current?.getSource("route")) {
        const source = map.current.getSource("route") as mapboxgl.GeoJSONSource;
        source.setData(geojson as GeoJSON.Feature);
      } else if (map.current) {
        map.current.addLayer({
          id: "route",
          type: "line",
          source: {
            type: "geojson",
            data: geojson as GeoJSON.Feature,
          },
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#3887be",
            "line-width": 5,
            "line-opacity": 0.75,
          },
        });
      }
    } catch (err) {
      console.error("Error fetching walking route:", err);
    }
  };

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 480);
      setShowLegend(window.innerWidth > 480); // Hide legend by default on mobile
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Toggle legend visibility
  const toggleLegend = () => {
    setShowLegend((prev) => !prev);
  };

  // First useEffect to initialize Mapbox with the token
  useEffect(() => {
    // Set the token when component mounts
    if (mapboxToken) {
      mapboxgl.accessToken = mapboxToken;
      console.log('Using token provided by App component');
    } else {
      console.log('Using fallback Mapbox token');
      mapboxgl.accessToken = FALLBACK_MAPBOX_TOKEN;
    }
  }, [mapboxToken]);

  // Second useEffect to initialize the map after token is set
  useEffect(() => {
    if (!mapContainer.current) {
      console.log('Waiting for container...');
      return;
    }

    if (!mapboxgl.accessToken) {
      console.error('Token missing');
      setError("Mapbox token is not set. Map functionality will not work.");
      setLoading(false);
      return;
    }

    console.log('Initializing map with token present');

    // Ensure the map container has dimensions before initializing
    if (mapContainer.current.offsetWidth === 0 || mapContainer.current.offsetHeight === 0) {
      console.warn('Map container has zero dimensions, forcing size');
      mapContainer.current.style.width = '100%';
      mapContainer.current.style.height = '400px'; // Enforce a minimum height
    }

    try {
      // Initialize map
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: currentLocation
          ? [currentLocation.lng, currentLocation.lat]
          : defaultCenter,
        zoom: currentLocation ? 16 : 11,
        attributionControl: false, // Hide attribution for more map space on mobile
      });

      // Add error handler - ensuring we turn off loading state if error occurs
      map.current.on('error', (e) => {
        console.error('Mapbox map error:', e);
        setError(`Map error: ${e.error?.message || 'Unknown error'}`);
        setLoading(false);
      });

      // Add style load event listener to set loading state to false when map is fully loaded
      map.current.on('style.load', () => {
        console.log('Map style loaded successfully');
        setLoading(false);
      });

      // Add general load event listener as backup
      map.current.on('load', () => {
        console.log('Map loaded successfully');
        setLoading(false);
      });

      // Force a resize after a short delay to ensure map renders correctly
      setTimeout(() => {
        if (map.current) {
          map.current.resize();
          console.log('Forced map resize to ensure proper rendering');
        }
      }, 200);

      // Add attribution control in a better position for mobile
      map.current.addControl(
        new mapboxgl.AttributionControl({
          compact: true,
        }),
        "bottom-right"
      );

      // Add navigation controls - adjusted for better mobile visibility
      map.current.addControl(
        new mapboxgl.NavigationControl({
          showCompass: false, // Simplify for mobile
        }),
        "top-right"
      );

      // Add user location control - important for mobile users to find nearby bins
      map.current.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
          },
          trackUserLocation: true,
          showUserHeading: true,
        }),
        "top-right"
      );

      // Handle error events
      map.current.on("error", (e) => {
        console.error("Mapbox error:", e.error);
        setError(`Map error: ${e.error?.message || "Unknown error"}`);
      });

      // Add marker for current location if available
      if (currentLocation) {
        markerRef.current = new mapboxgl.Marker({ color: "#FF0000" })
          .setLngLat([currentLocation.lng, currentLocation.lat])
          .addTo(map.current)
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
              "<h3>Directed Location</h3><p>This is the location you were directed to.</p>"
            )
          );
      }

      // Add marker for destination location if available
      if (destinationLocation) {
        markerRef.current = new mapboxgl.Marker({ color: "#00FFFF" })
          .setLngLat([destinationLocation.lng, destinationLocation.lat])
          .addTo(map.current)
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
              "<h3>Nearest recycling bin</h3><p>This is the nearest recycling bin to you.</p>"
            )
          );

        if (currentLocation) {
          getWalkingRoute(currentLocation, destinationLocation);

          // Fit bounds to include both start and end
          const bounds = new mapboxgl.LngLatBounds();
          bounds.extend([currentLocation.lng, currentLocation.lat]);
          bounds.extend([destinationLocation.lng, destinationLocation.lat]);

          map.current.fitBounds(bounds, {
            padding: 40, // Add some padding around the bounds
          });
        }
      }

      // Add marker for current position
      if (map.current) {
        markerRef.current = new mapboxgl.Marker({ color: "blue" })
          .setLngLat([-74.5, 40]) // Initial marker position
          .addTo(map.current);

        if ("geolocation" in navigator) {
          watchId.current = navigator.geolocation.watchPosition(
            (position) => {
              const { longitude, latitude, heading } = position.coords;
              const lngLat = { lng: longitude, lat: latitude };

              if (markerRef.current) {
                markerRef.current.setLngLat(lngLat);

                if (heading !== null) {
                  markerRef.current.getElement().style.transform = `rotate(${heading}deg)`;
                }
              }
            },
            (error) => {
              console.error("Error getting location:", error);
            }
          );
        } else {
          console.error("Geolocation is not available.");
        }
      }

      // Sample bin data
      const bins: RecyclingBin[] = [
        {
          lng: 103.8198,
          lat: 1.3521,
          name: "Central Singapore Bin",
          type: "comprehensive",
          accepts: ["Paper", "Plastic", "Glass", "Metal", "E-waste"],
          collectionTimes: "Daily, 8am - 8pm",
        },
        {
          lng: 103.7771,
          lat: 1.2949,
          name: "Buona Vista Bin",
          type: "general",
          accepts: ["Paper", "Plastic", "Metal"],
          collectionTimes: "Mon-Fri, 9am - 6pm",
        },
        {
          lng: 103.8178,
          lat: 1.3621,
          name: "Central Singapore Bin",
          type: "comprehensive",
          accepts: ["Paper", "Plastic", "Glass", "Metal", "E-waste"],
          collectionTimes: "Daily, 8am - 8pm",
        },
        {
          lng: 103.6771,
          lat: 1.2909,
          name: "Buona Vista Bin",
          type: "general",
          accepts: ["Paper", "Plastic", "Metal"],
          collectionTimes: "Mon-Fri, 9am - 6pm",
        },
        {
          lng: 103.8559,
          lat: 1.3438,
          name: "Geylang E-waste Bin",
          type: "electronic",
          accepts: ["Batteries", "Small electronics", "Cables"],
          collectionTimes: "24/7",
        },
        {
          lng: 103.9455,
          lat: 1.3509,
          name: "Tampines Paper Recycling",
          type: "paper",
          accepts: ["Newspapers", "Magazines", "Cardboard"],
          collectionTimes: "Mon-Sat, 10am - 7pm",
        },
        {
          lng: 103.8459,
          lat: 1.3451,
          name: "Geylang E-waste Bin",
          type: "electronic",
          accepts: ["Batteries", "Small electronics", "Cables"],
          collectionTimes: "24/7",
        },
        {
          lng: 103.9465,
          lat: 1.3521,
          name: "Tampines Paper Recycling",
          type: "paper",
          accepts: ["Newspapers", "Magazines", "Cardboard"],
          collectionTimes: "Mon-Sat, 10am - 7pm",
        },
        // Add more bins...
      ];

      // Add event for when map is loaded
      map.current.on("load", () => {
        setTimeout(() => setLoading(false), 500); // Short delay to ensure the map rendering completes

        // Add markers for bins
        bins.forEach((bin) => {
          // Create marker element
          const markerElement = document.createElement("div");
          markerElement.className = "bin-marker";
          markerElement.style.width = "24px";
          markerElement.style.height = "24px";
          markerElement.style.borderRadius = "50%";
          markerElement.style.backgroundColor = binColors[bin.type];
          markerElement.style.border = "2px solid white";
          markerElement.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)";
          markerElement.style.cursor = "pointer";

          // Create and add the marker
          const marker = new mapboxgl.Marker(markerElement)
            .setLngLat([bin.lng, bin.lat])
            .addTo(map.current!);

          // Create popup content
          const popupContent = `
            <div style="max-width: 220px;">
              <h3 style="margin: 0 0 8px; font-size: 16px; color: #333;">${
                bin.name
              }</h3>
              <p style="margin: 0 0 5px; font-size: 14px;"><strong>Type:</strong> ${
                bin.type.charAt(0).toUpperCase() + bin.type.slice(1)
              }</p>
              <p style="margin: 0 0 5px; font-size: 14px;"><strong>Accepts:</strong> ${bin.accepts.join(
                ", "
              )}</p>
              <p style="margin: 0; font-size: 14px;"><strong>Collection:</strong> ${
                bin.collectionTimes
              }</p>
            </div>
          `;

          // Add popup
          marker.setPopup(
            new mapboxgl.Popup({
              offset: 25,
              closeButton: true,
              maxWidth: "300px",
            }).setHTML(popupContent)
          );
        });
      });

      // Cleanup
      return () => {
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
        // Cleanup function to clear watchPosition
        if (watchId.current !== null) {
          navigator.geolocation.clearWatch(watchId.current);
        }
      };
    } catch (err) {
      console.error("Error initializing map:", err);
      setError(`Failed to initialize map: ${(err as Error).message}`);
      setLoading(false);
    }
  }, [currentLocation, destinationLocation, mapboxToken]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* MapContainer with explicit dimensions */}
      <MapContainer ref={mapContainer} id="map-container" />

      {/* Loading Overlay */}
      {loading && (
        <LoadingOverlay>
          <div>Loading map...</div>
        </LoadingOverlay>
      )}

      {/* Error display */}
      {error && (
        <div style={{ 
          padding: "20px", 
          color: "red", 
          textAlign: "center", 
          position: "absolute", 
          top: "50%", 
          left: "50%", 
          transform: "translate(-50%, -50%)",
          background: "rgba(255,255,255,0.9)",
          zIndex: 10,
          borderRadius: "8px",
          maxWidth: "80%" 
        }}>
          {error}
        </div>
      )}

      {showLegend && (
        <LegendContainer>
          <div style={{ fontWeight: "bold", marginBottom: "10px" }}>
            Bin Types
          </div>
          <LegendItem>
            <LegendColor color={binColors.general} />
            <div>General Recycling</div>
          </LegendItem>
          <LegendItem>
            <LegendColor color={binColors.electronic} />
            <div>E-waste</div>
          </LegendItem>
          <LegendItem>
            <LegendColor color={binColors.paper} />
            <div>Paper</div>
          </LegendItem>
          <LegendItem>
            <LegendColor color={binColors.comprehensive} />
            <div>Comprehensive</div>
          </LegendItem>
          <LegendItem>
            <LegendColor color="#FF0000" />
            <div>Directed Location</div>
          </LegendItem>
        </LegendContainer>
      )}

      {isMobile && !showLegend && (
        <InfoButton onClick={toggleLegend}>ⓘ</InfoButton>
      )}
    </div>
  );
};

export default BinMap;
