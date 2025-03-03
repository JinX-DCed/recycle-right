import React, { useEffect, useRef, useState } from 'react';
import mapboxgl, { LngLatLike } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import styled from 'styled-components';

// Use a valid Mapbox access token - replace with your own from mapbox.com
mapboxgl.accessToken = 'pk.eyJ1IjoieW9qZXJyeSIsImEiOiJjamRsZGZzaDYwNW52MnhxaGVta25pbWM5In0.23w4XcxSUUyeK263dtTOtg';

const MapContainer = styled.div`
  width: 100%;
  height: 70vh;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: white;
  border: none;
  border-radius: 50%;
  width: 44px; /* Larger for better touch target */
  height: 44px; /* Larger for better touch target */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px; /* Larger for better visibility */
  cursor: pointer;
  z-index: 5;
  
  &:hover {
    background-color: #f0f0f0;
  }
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
  background-color: ${props => props.color};
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
  type: 'general' | 'electronic' | 'paper' | 'comprehensive';
  accepts: string[];
  collectionTimes: string;
}

// Define colors for different bin types
const binColors: Record<RecyclingBin['type'], string> = {
  general: '#4CAF50',      // Green
  electronic: '#FF9800',   // Orange
  paper: '#2196F3',        // Blue
  comprehensive: '#9C27B0' // Purple
};

interface BinMapProps {
  onClose: () => void;
}

const BinMap: React.FC<BinMapProps> = ({ onClose }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLegend, setShowLegend] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Singapore center coordinates as LngLatLike
  const center: LngLatLike = { lng: 103.8198, lat: 1.3521 };

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 480);
      setShowLegend(window.innerWidth > 480); // Hide legend by default on mobile
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Toggle legend visibility
  const toggleLegend = () => {
    setShowLegend(prev => !prev);
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    try {
      // Initialize map
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: center,
        zoom: 11,
        attributionControl: false, // Hide attribution for more map space on mobile
      });

      // Add attribution control in a better position for mobile
      map.current.addControl(new mapboxgl.AttributionControl({
        compact: true
      }), 'bottom-right');

      // Add navigation controls - adjusted for better mobile visibility
      map.current.addControl(new mapboxgl.NavigationControl({
        showCompass: false // Simplify for mobile
      }), 'top-right');
      
      // Add user location control - important for mobile users to find nearby bins
      map.current.addControl(new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
      }), 'top-right');

      // Handle error events
      map.current.on('error', (e) => {
        console.error('Mapbox error:', e.error);
        setError(`Map error: ${e.error?.message || 'Unknown error'}`);
        setLoading(false);
      });

      // Wait for map to load
      map.current.on('load', () => {
        setLoading(false);
        setError(null);
        
        // Enhanced recycling bin data with types, collection times, and accepted items
        const bins: RecyclingBin[] = [
          { 
            lng: 103.8522, 
            lat: 1.3031, 
            name: "Tanjong Pagar Plaza Recycling Bin",
            type: "comprehensive",
            accepts: ["Paper", "Plastic", "Metal", "Glass", "Electronic waste"],
            collectionTimes: "Daily, 7:00 AM - 10:00 PM"
          },
          { 
            lng: 103.8300, 
            lat: 1.3100, 
            name: "Tiong Bahru Recycling Point",
            type: "general",
            accepts: ["Paper", "Plastic", "Metal"],
            collectionTimes: "Mon-Sat, 8:00 AM - 8:00 PM"
          },
          { 
            lng: 103.8400, 
            lat: 1.3200, 
            name: "Clarke Quay Recycling Station",
            type: "general",
            accepts: ["Paper", "Plastic", "Metal", "Glass"],
            collectionTimes: "Daily, 9:00 AM - 9:00 PM"
          },
          { 
            lng: 103.8484, 
            lat: 1.3644, 
            name: "Novena Square Recycling Bin",
            type: "electronic",
            accepts: ["Electronic waste", "Batteries"],
            collectionTimes: "Mon-Fri, 10:00 AM - 7:00 PM"
          },
          { 
            lng: 103.9428, 
            lat: 1.3203, 
            name: "Bedok Mall Recycling Point",
            type: "comprehensive",
            accepts: ["Paper", "Plastic", "Metal", "Glass", "Fabric", "Electronic waste"],
            collectionTimes: "Daily, 10:00 AM - 10:00 PM"
          },
          { 
            lng: 103.8318, 
            lat: 1.4318, 
            name: "Woodlands Plaza Recycling Station",
            type: "general",
            accepts: ["Paper", "Plastic", "Metal"],
            collectionTimes: "Mon-Sun, 7:00 AM - 7:00 PM"
          },
          { 
            lng: 103.7832, 
            lat: 1.3052, 
            name: "Holland Village Recycling Bin",
            type: "paper",
            accepts: ["Paper", "Cardboard"],
            collectionTimes: "Mon, Wed, Fri, 9:00 AM - 6:00 PM"
          },
          { 
            lng: 103.8559, 
            lat: 1.2971, 
            name: "Marina Bay Sands Recycling Point",
            type: "comprehensive",
            accepts: ["Paper", "Plastic", "Metal", "Glass", "Electronic waste"],
            collectionTimes: "Daily, 24 hours"
          },
        ];

        // Add markers for each bin
        bins.forEach(bin => {
          // Create a marker with color based on bin type
          const markerElement = document.createElement('div');
          markerElement.className = 'marker';
          markerElement.style.width = '30px'; // Larger for better touch target
          markerElement.style.height = '30px'; // Larger for better touch target
          markerElement.style.borderRadius = '50%';
          markerElement.style.backgroundColor = binColors[bin.type];
          markerElement.style.border = '3px solid white'; // More visible border
          markerElement.style.boxShadow = '0 3px 6px rgba(0, 0, 0, 0.3)';
          markerElement.style.cursor = 'pointer';
          
          // Create formatted content for popup - optimized for mobile
          const popupContent = `
            <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 280px; padding: 5px;">
              <h3 style="margin-top: 0; margin-bottom: 10px; color: ${binColors[bin.type]}; border-bottom: 1px solid #eee; padding-bottom: 8px; font-size: 18px;">${bin.name}</h3>
              <p style="margin: 8px 0; font-size: 15px;"><strong>Type:</strong> ${bin.type.charAt(0).toUpperCase() + bin.type.slice(1)} Recycling</p>
              <p style="margin: 8px 0; font-size: 15px;"><strong>Accepts:</strong></p>
              <ul style="padding-left: 20px; margin: 8px 0; font-size: 15px;">
                ${bin.accepts.map(item => `<li style="margin-bottom: 5px;">${item}</li>`).join('')}
              </ul>
              <p style="margin: 8px 0; font-size: 15px;"><strong>Collection Times:</strong><br>${bin.collectionTimes}</p>
              <div style="margin-top: 10px; text-align: center;">
                <a href="https://maps.google.com/?q=${bin.lat},${bin.lng}" target="_blank" style="display: inline-block; background-color: #4285F4; color: white; text-decoration: none; padding: 8px 12px; border-radius: 4px; font-size: 14px; margin-top: 5px;">
                  Get Directions
                </a>
              </div>
            </div>
          `;

          // Configure popup with options better suited for mobile
          const popup = new mapboxgl.Popup({
            offset: 25,
            closeButton: true,
            closeOnClick: false, // Don't close when map is clicked - better for mobile
            maxWidth: '300px',
            className: 'custom-popup' // For potential additional CSS styling
          }).setHTML(popupContent);

          // Add marker to map with proper LngLatLike format
          new mapboxgl.Marker(markerElement)
            .setLngLat({ lng: bin.lng, lat: bin.lat })
            .setPopup(popup)
            .addTo(map.current!);
        });
      });
    } catch (err) {
      console.error('Error initializing map:', err);
      setError(`Failed to initialize map: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setLoading(false);
    }

    // Clean up on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <MapContainer ref={mapContainer} />
      {loading && (
        <LoadingOverlay>
          <p>Loading map...</p>
        </LoadingOverlay>
      )}
      {error && (
        <LoadingOverlay>
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', maxWidth: '80%', textAlign: 'center' }}>
            <p style={{ color: 'red', fontWeight: 'bold' }}>Error loading map</p>
            <p>{error}</p>
            <p>Please make sure you have a valid Mapbox API key.</p>
            <button 
              onClick={onClose} 
              style={{ 
                backgroundColor: '#006647', 
                color: 'white', 
                padding: '12px 20px', /* Larger for better touch target */
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer',
                fontSize: '16px', /* Larger font for mobile */
                marginTop: '10px'
              }}
            >
              Close
            </button>
          </div>
        </LoadingOverlay>
      )}
      {showLegend && (
        <LegendContainer>
          <div style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: isMobile ? '16px' : '14px' }}>
            Recycling Bin Types
          </div>
          {Object.entries(binColors).map(([type, color]) => (
            <LegendItem key={type}>
              <LegendColor color={color} />
              <span style={{ fontSize: isMobile ? '15px' : '14px' }}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </span>
            </LegendItem>
          ))}
        </LegendContainer>
      )}
      {isMobile && (
        <InfoButton onClick={toggleLegend}>
          {showLegend ? '×' : 'i'}
        </InfoButton>
      )}
      <CloseButton onClick={onClose}>×</CloseButton>
    </div>
  );
};

export default BinMap;
