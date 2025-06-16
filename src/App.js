import { Route, BrowserRouter as Router, Routes } from 'react-router';
import './App.css';

import Homepage from './components/Homepage';
import Booking from './components/Booking';
import Confirmation from './components/Confirmation';

function App() {
  return (
    <>
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/bookings" element={<Booking />} />
        <Route path="/confirmation" element={<Confirmation />} />
      </Routes>
    </Router>
    </>
  );
}

export default App;
