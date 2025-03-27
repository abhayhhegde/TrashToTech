import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login"; // Import your Login page
import Signup from "./pages/SignUp"; // Import your Signup page
import Navbar from "./components/Navbar"; // Assuming you have a Navbar component
import Footer from "./components/Footer"; // Assuming you have a Footer component
import Contact from "./pages/Contact";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute"; // Import the ProtectedRoute component
import RecyclePage from "./pages/RecyclePage";
import Rewards from "./pages/Rewards";
function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-900">
        <Navbar /> {/* Navbar will be present on every page */}
        <div className="flex-grow flex justify-center items-center">
          <Routes>
            <Route path="/" element={<Home />} /> {/* Home page */}
            <Route path="/login" element={<Login />} /> {/* Login page */}
            <Route path="/signup" element={<Signup />} /> {/* Signup page */}
            <Route path="/contact" element={<Contact />} /> {/* Contact page */}
            <Route path="/about" element={<About />} /> {/* About page */}
            <Route path="/recyclepage" element={<RecyclePage />} />
            <Route path="/rewards" element={<Rewards />}></Route>
            {/* Protected Dashboard route */}
            <Route
              path="/dashboard"
              element={
               
                  <Dashboard /> 
               
              }
            />
          </Routes>
        </div>
        <Footer /> {/* Footer will be present on every page */}
      </div>
    </Router>
  );
}

export default App;
