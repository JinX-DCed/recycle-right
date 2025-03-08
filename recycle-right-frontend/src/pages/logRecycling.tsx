import React, { useState, useContext, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faTrash, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";
import Header from "../components/Header";
import { RecycleRightContext } from "../App";
import { useNavigate } from "react-router-dom";

const Container = styled.div`
  max-width: 400px;
  margin: 0 auto;
  padding: 16px;
  background-color: #f9fafb;
  min-height: 100vh;
`;

const Card = styled.div`
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 12px;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 16px;
`;

const Button = styled.button`
  background-color: #00a108;
  color: white;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;

  &:hover {
    background-color: #008a06;
    transform: scale(1.02);
  }
`;

const DeleteButton = styled(Button)`
  background-color: #ff4d4d;
  &:hover {
    background-color: #d93d3d;
  }
`;

// Define the interface for our item display
interface Item {
	id: number;
	name: string;
	points: number;
	recyclable: boolean;
	error?: string;
	imageUrl?: string | null;
}

const LogRecycling = () => {
	const [itemPoints, setItemPoints] = useState(0);
	const [items, setItems] = useState<Item[]>([]);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const navigate = useNavigate();

	// Get the context data
	const { recognizedItem, updateTotalPoints } = useContext(RecycleRightContext);
	
	// Handle image upload for retaking photos
	const handleRetakePhoto = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click();
		}
	};

	// Handle deleting an item
	const handleDeleteItem = (id: number) => {
		setItems(prevItems => prevItems.filter(item => item.id !== id));
		setItemPoints(0); // Reset points when deleting an item
	};

	// Handle submitting the log
	const handleSubmitLog = () => {
		// Add points to the user's total
		updateTotalPoints(itemPoints);
		
		// Show success message
		alert(`Success! Added ${itemPoints} points to your total.`);
		
		// Navigate back to the home page
		navigate('/');
	};
	
	// Update items when recognized item changes
	useEffect(() => {
		if (recognizedItem && recognizedItem.name) {
			// Create a new item based on the recognized data
			const newItem: Item = {
				id: Date.now(), // Use timestamp as unique ID
				name: recognizedItem.name,
				points: recognizedItem.canBeRecycled ? 10 : 0,
				recyclable: recognizedItem.canBeRecycled,
				imageUrl: recognizedItem.imageUrl
			};
			
			// Add error message for non-recyclable items
			if (!recognizedItem.canBeRecycled) {
				newItem.error = "This item cannot be recycled. Please delete, or re-take the photo if item has been wrongly identified.";
			}
			
			// Add the new item to the list
			setItems([newItem]);
			
			// Update item points
			setItemPoints(newItem.points);
		} else if (items.length === 0) {
			// If no recognized item and no items, show a default item
			setItems([
				{ 
					id: 1, 
					name: "No item recognized", 
					points: 0, 
					recyclable: false,
					error: "No item was recognized. Please retake the photo or return to the home screen." 
				}
			]);
		}
	}, [recognizedItem]);
	
	const canSubmit = itemPoints > 0;

	return (
		<Container>
			{/* Header */}
			<Header />

			{/* Items List */}
			{items.map((item) => (
				<Card key={item.id}>
					<div className="flex justify-between items-center">
						{/* Item Name with Icon */}
						<div className="flex items-center gap-2">
							{item.recyclable ? (
								<FontAwesomeIcon icon={faCamera} className="text-gray-700" />
							) : (
								<FontAwesomeIcon icon={faExclamationCircle} className="text-red-500" />
							)}
							<h2 className={`font-semibold ${item.recyclable ? "text-gray-900" : "text-red-600"}`}>
								{item.name}
							</h2>
						</div>
						{/* Points Display */}
						{item.recyclable && <span className="text-gray-500">{item.points}pts</span>}
					</div>

					{/* Display Image if Available */}
					{item.imageUrl && (
						<div className="mt-2 mb-2">
							<img 
								src={item.imageUrl} 
								alt={item.name} 
								style={{ 
									maxWidth: "100%", 
									borderRadius: "8px",
									border: item.recyclable ? "2px solid #00a108" : "2px solid #ff4d4d" 
								}} 
							/>
						</div>
					)}

					{/* Error Message for Non-Recyclable Items */}
					{!item.recyclable && (
						<p className="text-red-500 text-sm mt-1">{item.error}</p>
					)}

					{/* Action Buttons */}
					<div className="mt-3 flex gap-2">
						<ButtonContainer>
							<Button onClick={handleRetakePhoto}>
								<FontAwesomeIcon icon={faCamera} /> Re-take Photo
								<input
									ref={fileInputRef}
									type="file"
									accept="image/*"
									style={{ display: 'none' }}
									// Use the same ID as in App.tsx to trigger the same flow
									id="image-upload-retake"
									onChange={() => navigate('/')}
								/>
							</Button>
							<DeleteButton onClick={() => handleDeleteItem(item.id)}>
								<FontAwesomeIcon icon={faTrash} /> Delete
							</DeleteButton>
						</ButtonContainer>
					</div>
				</Card>
			))}

			{/* Total Points */}
			<Card className="flex justify-between items-center text-lg font-semibold">
				<span>Total points: </span>
				<span>{itemPoints}pts</span>
			</Card>

			{/* Submit Button */}

			<Button 
				className="mt-4" 
				disabled={!canSubmit}
				onClick={handleSubmitLog}
			>
				Submit Log
			</Button>
		</Container>
	);
};

export default LogRecycling;
