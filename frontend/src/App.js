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
import AdminConfirm from "./pages/AdminConfirm";
import FacilityLocator from "./pages/FacilityLocator";
import FacilityLogin from "./pages/FacilityLogin";
import FacilityRegister from "./pages/FacilityRegister";
import FacilityConfirm from "./pages/FacilityConfirm";

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
            <Route path="/facilities" element={<FacilityLocator />} />
            <Route path="/facility-locator" element={<FacilityLocator />} />

            {/* Facility Routes */}
            <Route path="/facility/login" element={<FacilityLogin />} />
            <Route path="/facility/register" element={<FacilityRegister />} />
            <Route path="/facility/confirm" element={<FacilityConfirm />} />

            {/* Protected Dashboard route */}
            <Route
              path="/dashboard"
              element={
               <ProtectedRoute>
                  <Dashboard />
               </ProtectedRoute>
              }
            />
            <Route path="/admin/confirm" element={<ProtectedRoute><AdminConfirm /></ProtectedRoute>} />
          </Routes>
        </div>
        <Footer /> {/* Footer will be present on every page */}
      </div>
    </Router>
  );
}

export default App;
