import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Header from "./components/Header";
import Button from "./components/Button";
import Activity from "./components/Activity";
import Navigation from "./components/Navigation";
import styled from 'styled-components';
import LogRecycling from './pages/logRecycling';

// Define the styled component
const Container = styled.div`
  max-width: 28rem; 
  margin: 0 auto;
  padding: 1rem; 
  background-color: #f9fafb;
  min-height: 100vh;
`;

const App = () => {
  return (
    <Router>
      <Container>
        <Header />
        <div className="p-4">
          <h1 className="text-2xl font-bold text-center mb-3">Trashtalker</h1>
          <Link to="/log-recycling">
            <Button text="➕ Log recycling" />
          </Link>
          <Activity />
          <Navigation />
        </div>
      </Container>

      <Routes>
        <Route path="/log-recycling" element={<LogRecycling />} />
        {/* Add other routes here if needed */}
      </Routes>
    </Router>
  );
};

export default App;
