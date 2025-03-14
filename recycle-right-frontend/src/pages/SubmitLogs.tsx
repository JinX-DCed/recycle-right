import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Header from "../components/Header";

// Define an interface for the TaskItem props
interface TaskItemProps {
  completed: boolean;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f9fafb;
  padding: 40px; /* Adjusted padding */
  min-height: 100vh; /* Ensure full height */
  box-sizing: border-box; /* Include padding in height calculations */
`;

const Card = styled.div`
  max-width: 400px;
  width: 100%;
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const ProgressBarContainer = styled.div`
  position: relative;
  width: 100%;
  margin-top: 16px;
`;

const ProgressBar = styled.div`
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden; /* Prevent overflow */
`;

const ProgressFill = styled.div`
  height: 100%;
  background-color: #3b82f6; /* Blue color */
  border-radius: 4px;
  transition: width 0.5s ease; /* Smooth transition */
`;

const ProgressText = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  font-size: 12px;
  color: #6b7280; /* Gray color */
`;

const TaskList = styled.ul`
  margin-top: 16px;
  list-style: none;
  padding: 0;
`;

const TaskItem = styled.li<TaskItemProps>`
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  background-color: ${(props) => (props.completed ? "#d1fae5" : "white")};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const TaskText = styled.p<TaskItemProps>`
  flex: 1;
  color: ${(props) => (props.completed ? "#065f46" : "#374151")};
`;

const BackButton = styled.button`
  margin-top: 20px;
  width: 100%;
  background-color: #1f2937; /* Dark gray */
  color: white;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #4b5563; /* Lighter gray */
  }
`;

const SubmitLogs = () => {
  const totalPoints = 200;
  const newPoints = 140;
  const nextMilestone = 300;

  const tasks = [
    {
      text: "Recycle 3 types of items",
      progress: "1/3",
      status: "In progress",
      completed: false,
    },
    { text: "Recycle 1 item", points: 20, completed: true },
    { text: "5-day streak", points: 80, completed: true },
  ];

  // State for progress percentage
  const [progressPercentage, setProgressPercentage] = useState(0);

  // Calculate the total progress percentage
  const totalProgress = totalPoints + newPoints;

  useEffect(() => {
    const newProgress = Math.min((totalProgress / nextMilestone) * 100, 100); // Ensure it doesn't exceed 100%
    setProgressPercentage(newProgress);
  }, [totalPoints, newPoints, nextMilestone]);

  return (
    <>
      <Header title="Log recycled item" />
      <Container>
        <Card>
          <h2 className="text-4xl">😊</h2>
          <h3 className="text-xl font-semibold mt-2">Yay!</h3>
          <p className="text-gray-600">Thank you for saving the earth!</p>

          {/* Progress Bar */}
          <ProgressBarContainer>
            <ProgressBar>
              <ProgressFill style={{ width: `${progressPercentage}%` }} />
            </ProgressBar>
            <ProgressText>
              <span>{totalPoints}pts</span>
              <span>{nextMilestone}pts</span>
            </ProgressText>
          </ProgressBarContainer>

          {/* Task List */}
          <TaskList>
            {tasks.map((task, index) => (
              <TaskItem key={index} completed={task.completed}>
                <span
                  className={`mr-3 text-lg ${
                    task.completed ? "text-green-500" : "text-gray-400"
                  }`}
                >
                  {task.completed ? "✔️" : "⚪"}
                </span>
                <TaskText completed={task.completed}>{task.text}</TaskText>
                {task.points && (
                  <p className="text-sm font-semibold text-blue-600">
                    {task.points}pts
                  </p>
                )}
              </TaskItem>
            ))}
          </TaskList>

          {/* Back Button */}
          <BackButton onClick={() => (window.location.href = "/")}>
            Back to Home
          </BackButton>
        </Card>
      </Container>
    </>
  );
};

export default SubmitLogs;
