import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faTrash, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";
import Header from "../components/Header";

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

const LogRecycling = () => {
	const [totalPoints, setTotalPoints] = useState(0);

	const items = [
		{ id: 1, name: "Plastic drink bottle", points: 20, recyclable: true },
		{
			id: 2,
			name: "Nalgene water bottle",
			points: 0,
			recyclable: false,
			error: "This item cannot be recycled. Please delete, or re-take the photo if item has been wrongly identified.",
		},
	];

	const canSubmit = totalPoints > 0;

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

					{/* Error Message for Non-Recyclable Items */}
					{!item.recyclable && (
						<p className="text-red-500 text-sm mt-1">{item.error}</p>
					)}

					{/* Action Buttons */}
					<div className="mt-3 flex gap-2">
						<ButtonContainer>
							<Button>
								<FontAwesomeIcon icon={faCamera} /> Re-take Photo
								<input
									type="file"
									accept="image/*"
									style={{ display: 'none' }}
									id="image-upload"
								/>
							</Button>
							<DeleteButton>
								<FontAwesomeIcon icon={faTrash} /> Delete
							</DeleteButton>
						</ButtonContainer>
					</div>
				</Card>
			))}

			{/* Total Points */}
			<Card className="flex justify-between items-center text-lg font-semibold">
				<span>Total points: </span>
				<span>{items.filter(item => item.recyclable).reduce((total, item) => total + item.points, 0)}pts</span>
			</Card>

			{/* Submit Button */}

			<Button className="mt-4" disabled={!canSubmit}>
				Submit Log
			</Button>
		</Container>
	);
};

export default LogRecycling;
