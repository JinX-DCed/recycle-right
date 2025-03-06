import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import Header from "./components/Header";
import Activity from "./components/Activity";
import Navigation from "./components/Navigation";
import styled from 'styled-components';
import { useState } from 'react';
import LogRecycling from './pages/logRecycling';
import Modal from './components/Modal';
import BinMapPage from './pages/BinMapPage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment, faPlus } from '@fortawesome/free-solid-svg-icons';  // Chat bubble icon

const Container = styled.div`
  max-width: 28rem; 
  margin: 0 auto;
  padding: 1rem; 
  background-color: #f9fafb;
  min-height: 100vh;
`;

const LRButton = styled.button`
  background-color: #006647; 
  color: white;
  width: 100%;
  padding: 12px;
  border-radius: 8px; 
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  font-size: 18px;
  margin-bottom: 20px;
  font-weight: 600; 
  transition: background-color 0.3s, transform 0.2s;

  &:hover {
    background-color: #25eb92;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const TTButton = styled.button`
  background-color: #006647; 
  color: white;
  width: 100%;
  padding: 12px;
  border-radius: 8px; 
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  font-size: 18px;
  font-weight: 600; 
  margin-bottom: 10px;
  transition: background-color 0.3s, transform 0.2s;

  &:hover {
    background-color: #25eb92;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const App = () => {
	const [totalPoints, setTotalPoints] = useState(0);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [uploadedImage, setUploadedImage] = useState<string | null>(null);
	const [recyclableDescription, setRecyclableDescription] = useState('');

	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const imageUrl = URL.createObjectURL(file);
			setUploadedImage(imageUrl);
			const canRecycle = true;
			setRecyclableDescription(canRecycle ? 'This item can be recycled.' : 'This item cannot be recycled.');
			setTotalPoints(prevPoints => prevPoints + (canRecycle ? 10 : 0));
			setIsModalOpen(true);
		}
	};

	const HomePage = () => {
		const navigate = useNavigate();

		const handleImageUploadWithNavigation = (e: React.ChangeEvent<HTMLInputElement>) => {
			handleImageUpload(e);
			navigate('/logRecycling');
			setIsModalOpen(false);
		};
		return (
			<Container>
				<Header />
				<div style={{ textAlign: 'center', margin: '20px 0', fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
					Total Points: <span style={{ color: '#006647' }}>{totalPoints}</span> | Donovan
				</div>
				<div className="p-4">
					<TTButton>
						<FontAwesomeIcon icon={faComment} className="text-gray-700" /> Trashtalker
					</TTButton>
					{/* <Link to="/logRecycling"> */}
					<LRButton>
						<input
							type="file"
							accept="image/*"
							onChange={handleImageUploadWithNavigation}
							style={{ display: 'none' }}
							id="image-upload"
						/>
						<label htmlFor="image-upload" style={{ color: 'white', textDecoration: 'none', width: '100%', display: 'block' }}>
							<FontAwesomeIcon icon={faPlus} className="text-gray-700" /> Log Recycling
						</label>
					</LRButton>
					{/* </Link> */}
					<Activity />
					<Navigation />
				</div>
			</Container>
		);
	};

	return (
		<Router>
			<Routes>
				<Route path="/" element={<HomePage />} />
				<Route path="/binmap" element={<BinMapPage />} />
				<Route path="/logRecycling" element={<LogRecycling />} />
			</Routes>

			{/* Modal for displaying uploaded image and information */}
			{isModalOpen && (
				<Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
					<h2>Uploaded Image</h2>
					{uploadedImage && <img src={uploadedImage} alt="Uploaded" style={{ maxWidth: '100%' }} />}
					<p>{recyclableDescription}</p>
					<p>You earned {totalPoints} points!</p>
				</Modal>
			)}
		</Router>
	);
};

export default App;
