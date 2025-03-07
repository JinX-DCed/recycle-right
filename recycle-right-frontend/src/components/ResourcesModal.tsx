import styled from 'styled-components';

interface ResourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 90%;
  max-height: 90%;
  overflow-y: auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const CloseButton = styled.button`
  background-color: #f44336;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  margin-top: 20px;
  
  &:hover {
    background-color: #d32f2f;
  }
`;

const ResourceTitle = styled.h2`
  color: #006647;
  margin-bottom: 20px;
`;

const ResourceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ResourceCard = styled.a`
  display: block;
  padding: 16px;
  background-color: #f0f9f0;
  border-left: 5px solid #006647;
  border-radius: 4px;
  text-decoration: none;
  color: #333;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    background-color: #e0f2e0;
  }
`;

const ResourceName = styled.h3`
  margin: 0 0 8px 0;
  color: #006647;
`;

const ResourceDescription = styled.p`
  margin: 0;
  font-size: 14px;
`;

const ResourcesModal = ({ isOpen, onClose }: ResourcesModalProps) => {
  if (!isOpen) return null;

  const resources = [
    {
      name: 'Recycle Right',
      url: 'https://www.cgs.gov.sg/recycleright/how-to-recycle-right/',
      description: 'Website that provides guidelines to educate residents on proper recycling practices'
    },
    {
      name: 'Comtainminants',
      url: 'https://www.cgs.gov.sg/recycleright/know-your-contaminants/',
      description: 'The webpage from Singapore National Environment Agency (NEA) provides guidelines on proper recycling by identifying common contaminants that disrupt the recycling process.'
    },
    {
      name: 'Waste problem',
      url: 'https://www.cgs.gov.sg/sayyes/the-waste-problem/',
      description: 'The Waste Problem, highlights Singapore growing waste issue due to urbanization and consumption. It emphasizes the importance of reducing, reusing, and recycling waste to combat landfill reliance and environmental harm. '
    },
    {
      name: 'National Recycling Programme (NEA)',
      url: 'https://www.nea.gov.sg/our-services/waste-management/3r-programmes-and-resources/national-recycling-programme',
      description: 'Official information about Singapore\'s National Recycling Programme by the National Environment Agency.'
    },
    {
      name: 'NEA E-Portal',
      url: 'https://www.eportal.nea.gov.sg/',
      description: 'NEA\'s digital services portal for various environment-related applications and services.'
    }
  ];

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ResourceTitle>Useful Resources</ResourceTitle>
        <ResourceList>
          {resources.map((resource, index) => (
            <ResourceCard 
              key={index} 
              href={resource.url} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <ResourceName>{resource.name}</ResourceName>
              <ResourceDescription>{resource.description}</ResourceDescription>
            </ResourceCard>
          ))}
        </ResourceList>
        <CloseButton onClick={onClose}>Close</CloseButton>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ResourcesModal;
