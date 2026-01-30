import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/SignUp";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Contact from "./pages/Contact";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import RecyclePage from "./pages/RecyclePage";
import Rewards from "./pages/Rewards";
import FacilityLocator from "./pages/FacilityLocator";
import FacilityLogin from "./pages/FacilityLogin";
import FacilityRegister from "./pages/FacilityRegister";
import FacilityConfirm from "./pages/FacilityConfirm";
import FacilityDashboard from './pages/FacilityDashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-900 text-white">
        <Navbar />
        
        
        <div className="flex-grow w-full"> 
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            
            {/* User Features */}
            <Route path="/recycle" element={<ProtectedRoute><RecyclePage /></ProtectedRoute>} />
            <Route path="/rewards" element={<ProtectedRoute><Rewards /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            
            {/* Maps */}
            <Route path="/facilities" element={<FacilityLocator />} />
            
            {/* Facility Portal */}
            <Route path="/facility/login" element={<FacilityLogin />} />
            <Route path="/facility/register" element={<FacilityRegister />} />
            <Route path="/facility/confirm" element={<FacilityConfirm />} />
            <Route path="/facility-dashboard" element={<FacilityDashboard />} />
          </Routes>
        </div>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;