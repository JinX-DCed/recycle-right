import React, { useEffect, useRef, useState } from 'react';
import mapboxgl, { LngLatLike } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import styled from 'styled-components';

// Use a valid Mapbox access token - replace with your own from mapbox.com
mapboxgl.accessToken = 'pk.eyJ1IjoieW9qZXJyeSIsImEiOiJjamRsZGZzaDYwNW52MnhxaGVta25pbWM5In0.23w4XcxSUUyeK263dtTOtg';

const MapContainer = styled.div`
  max-width: 28rem; /* Match the App container width */
  width: 100%;
  height: 70vh;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
  margin: 0 auto; /* Center the map */
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
  directedLocation?: { lat: number; lng: number } | null;
}

const BinMap: React.FC<BinMapProps> = ({ onClose, directedLocation }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLegend, setShowLegend] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  // Default Singapore center coordinates
  const defaultCenter: LngLatLike = { lng: 103.8198, lat: 1.3521 };
  
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
  
  // Center the map on the directed location
  useEffect(() => {
    if (map.current && directedLocation) {
      map.current.flyTo({
        center: [directedLocation.lng, directedLocation.lat],
        zoom: 16,
        essential: true
      });
      
      // Add a marker at the directed location
      if (markerRef.current) {
        markerRef.current.remove();
      }
      
      markerRef.current = new mapboxgl.Marker({ color: '#FF0000' })
        .setLngLat([directedLocation.lng, directedLocation.lat])
        .addTo(map.current)
        .setPopup(new mapboxgl.Popup({ offset: 25 })
          .setHTML('<h3>Directed Location</h3><p>This is the location you were directed to.</p>'));
    }
  }, [directedLocation, map.current]);

  useEffect(() => {
    if (!mapContainer.current) return;

    try {
      // Initialize map
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: directedLocation ? [directedLocation.lng, directedLocation.lat] : defaultCenter,
        zoom: directedLocation ? 16 : 11,
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
      });

      // Add marker for directed location if available
      if (directedLocation) {
        markerRef.current = new mapboxgl.Marker({ color: '#FF0000' })
          .setLngLat([directedLocation.lng, directedLocation.lat])
          .addTo(map.current)
          .setPopup(new mapboxgl.Popup({ offset: 25 })
            .setHTML('<h3>Directed Location</h3><p>This is the location you were directed to.</p>'));
      }

      // Sample bin data
      const bins: RecyclingBin[] = [
        {
          lng: 103.8198,
          lat: 1.3521,
          name: "Central Singapore Bin",
          type: "comprehensive",
          accepts: ["Paper", "Plastic", "Glass", "Metal", "E-waste"],
          collectionTimes: "Daily, 8am - 8pm"
        },
        {
          lng: 103.7771,
          lat: 1.2949,
          name: "Buona Vista Bin",
          type: "general",
          accepts: ["Paper", "Plastic", "Metal"],
          collectionTimes: "Mon-Fri, 9am - 6pm"
        },
        {
          lng: 103.8559,
          lat: 1.3438,
          name: "Geylang E-waste Bin",
          type: "electronic",
          accepts: ["Batteries", "Small electronics", "Cables"],
          collectionTimes: "24/7"
        },
        {
          lng: 103.9455,
          lat: 1.3509,
          name: "Tampines Paper Recycling",
          type: "paper",
          accepts: ["Newspapers", "Magazines", "Cardboard"],
          collectionTimes: "Mon-Sat, 10am - 7pm"
        },
        // Add more bins...
      ];

      // Add event for when map is loaded
      map.current.on('load', () => {
        setTimeout(() => setLoading(false), 500); // Short delay to ensure the map rendering completes
        
        // Add markers for bins
        bins.forEach(bin => {
          // Create marker element
          const markerElement = document.createElement('div');
          markerElement.className = 'bin-marker';
          markerElement.style.width = '24px';
          markerElement.style.height = '24px';
          markerElement.style.borderRadius = '50%';
          markerElement.style.backgroundColor = binColors[bin.type];
          markerElement.style.border = '2px solid white';
          markerElement.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
          markerElement.style.cursor = 'pointer';

          // Create and add the marker
          const marker = new mapboxgl.Marker(markerElement)
            .setLngLat([bin.lng, bin.lat])
            .addTo(map.current!);

          // Create popup content
          const popupContent = `
            <div style="max-width: 220px;">
              <h3 style="margin: 0 0 8px; font-size: 16px; color: #333;">${bin.name}</h3>
              <p style="margin: 0 0 5px; font-size: 14px;"><strong>Type:</strong> ${bin.type.charAt(0).toUpperCase() + bin.type.slice(1)}</p>
              <p style="margin: 0 0 5px; font-size: 14px;"><strong>Accepts:</strong> ${bin.accepts.join(', ')}</p>
              <p style="margin: 0; font-size: 14px;"><strong>Collection:</strong> ${bin.collectionTimes}</p>
            </div>
          `;

          // Add popup
          marker.setPopup(new mapboxgl.Popup({
            offset: 25,
            closeButton: true,
            maxWidth: '300px'
          }).setHTML(popupContent));
        });
      });

      // Cleanup
      return () => {
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
      };
    } catch (err) {
      console.error("Error initializing map:", err);
      setError(`Failed to initialize map: ${(err as Error).message}`);
      setLoading(false);
    }
  }, []);

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <MapContainer ref={mapContainer} />
      
      {loading && (
        <LoadingOverlay>
          <div>Loading map...</div>
        </LoadingOverlay>
      )}
      
      {error && (
        <div style={{ padding: '20px', color: 'red', textAlign: 'center' }}>
          {error}
        </div>
      )}
      
      <CloseButton onClick={onClose}>×</CloseButton>
      
      {showLegend && (
        <LegendContainer>
          <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>Bin Types</div>
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
