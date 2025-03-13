import React, { useEffect, useState, useContext } from "react";
import styled from "styled-components";
import BinMap from "../components/BinMap";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { Coords } from "../components/ChatInterface";
import { SESSION_STORAGE_NAMES } from "../components/constants";
import { RecycleRightContext } from "../App";

const PageContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: white;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center; /* Center content horizontally */
`;

const ContentWrapper = styled.div`
  width: 100%;
  max-width: 28rem; /* Match the App container width */
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  background-color: #8390fa;
  color: white;
  padding: 16px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  margin-right: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Title = styled.h1`
  font-size: 1.25rem;
  margin: 0;
`;

const MapContainer = styled.div`
  flex: 1;
  position: relative;
  width: 100%;
`;

const BinMapPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentLocation, setCurrentLocation] = useState<Coords | null>(null);
  const [destinationLocation, setDestinationLocation] = useState<Coords | null>(
    null
  );
  const { mapboxToken } = useContext(RecycleRightContext);

  useEffect(() => {
    // Check if there's a directed location in session storage
    const locationData = sessionStorage.getItem(SESSION_STORAGE_NAMES.OVERALL);
    if (locationData) {
      try {
        const parsedLocation = JSON.parse(locationData);
        if (parsedLocation.currentLocation) {
          setCurrentLocation(parsedLocation.currentLocation);
        }

        if (parsedLocation.destinationLocation) {
          setDestinationLocation(parsedLocation.destinationLocation);
        }

        // Clear the session storage after retrieving the location
        sessionStorage.removeItem(SESSION_STORAGE_NAMES.OVERALL);
      } catch (error) {
        console.error("Error parsing location data:", error);
      }
    }
  }, []);

  const handleBack = () => {
    navigate("/");
  };

  return (
    <PageContainer>
      <ContentWrapper>
        <Header>
          <BackButton onClick={handleBack}>
            <FontAwesomeIcon icon={faArrowLeft} />
          </BackButton>
          <Title>Recycling Bins Map</Title>
        </Header>
        <MapContainer>
          <BinMap
            onClose={handleBack}
            currentLocation={currentLocation}
            destinationLocation={destinationLocation}
            mapboxToken={mapboxToken}
          />
        </MapContainer>
      </ContentWrapper>
    </PageContainer>
  );
};

export default BinMapPage;
