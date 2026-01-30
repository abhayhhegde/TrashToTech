import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(window.pageYOffset);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      // FIX: Check ALL possible storage locations and keys
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("token") ||
        sessionStorage.getItem("authToken");

      if (token) {
        // 1. Determine User Type
        const userType =
          localStorage.getItem("userType") ||
          sessionStorage.getItem("userType") ||
          "user";

        // 2. Robust Name Extraction
        let name = "User";

        if (userType === "facility") {
          name = localStorage.getItem("facilityName") || "Partner";
        } else {
          const directName =
            localStorage.getItem("userName") ||
            sessionStorage.getItem("userName");

          const userObjString =
            localStorage.getItem("user") || sessionStorage.getItem("user");
          let jsonName = null;
          if (userObjString) {
            try {
              const userObj = JSON.parse(userObjString);
              jsonName =
                userObj.username || userObj.name || userObj.email.split("@")[0];
            } catch (e) {
              console.log("JSON parse error", e);
            }
          }

          name = directName || jsonName || "User";
        }

        setUser({
          name: name,
          type: userType,
          initial: name.charAt(0).toUpperCase(),
        });
      } else {
        setUser(null);
      }
    };

    checkAuth();
  }, [location]); 

  // Scroll Logic
  const handleScroll = () => {
    const currentScrollPos = window.pageYOffset;
    const isScrollingUp = prevScrollPos > currentScrollPos;
    setIsVisible(isScrollingUp || currentScrollPos < 10);
    setPrevScrollPos(currentScrollPos);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos]);

  const handleLogout = () => {
   
    localStorage.clear();
    sessionStorage.clear();

    setUser(null);
    setDropdownOpen(false);
    navigate("/login");
  };

  return (
    <nav
      className={`fixed w-full z-50 bg-gray-800 shadow-lg p-4 transition-transform duration-300 ${isVisible ? "translate-y-0" : "-translate-y-full"}`}
    >
      <div className="container mx-auto flex justify-between items-center">
        {/* LOGO */}
        <Link to="/" className="flex items-center group">
          <h1 className="text-2xl font-bold text-white group-hover:text-green-400 transition">
            TrashToTech
          </h1>
          <p className="text-sm text-gray-300 italic ml-2 mt-4 hidden md:block">
            Recycle, Reward, Repeat
          </p>
        </Link>

        {/* LINKS */}
        <div className="flex items-center space-x-6">
          <Link
            to="/"
            className={`transition-colors duration-300 ${location.pathname === "/" ? "text-green-400 font-bold" : "text-gray-300 hover:text-green-400"}`}
          >
            Home
          </Link>

          {user?.type === "facility" ? (
            <Link
              to="/facility-dashboard"
              className={`transition-colors duration-300 ${location.pathname === "/facility-dashboard" ? "text-green-400 font-bold" : "text-gray-300 hover:text-green-400"}`}
            >
              Dashboard
            </Link>
          ) : (
            <Link
              to="/facilities"
              className={`transition-colors duration-300 ${location.pathname === "/facilities" ? "text-green-400 font-bold" : "text-gray-300 hover:text-green-400"}`}
            >
              Find Facilities
            </Link>
          )}

          <Link
            to="/about"
            className={`transition-colors duration-300 ${location.pathname === "/about" ? "text-green-400 font-bold" : "text-gray-300 hover:text-green-400"}`}
          >
            About
          </Link>
          {user?.type !== "facility" && (
            <Link
              to="/rewards"
              className={`transition-colors duration-300 ${location.pathname === "/rewards" ? "text-green-400 font-bold" : "text-gray-300 hover:text-green-400"}`}
            >
              Rewards 🎁
            </Link>
          )}

          <Link
              to="/contact"
              className={`transition-colors duration-300 ${location.pathname === "/contact" ? "text-green-400 font-bold" : "text-gray-300 hover:text-green-400"}`}
            >
              Contact
            </Link>

          {/* AUTH SECTION */}
          {user ? (
            <div className="relative flex items-center space-x-4">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-3 focus:outline-none group"
              >
                <div className="text-right hidden md:block">
                  <p className="text-sm text-white font-semibold leading-none">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-blue-400 uppercase font-bold mt-1">
                    {user.type === "facility" ? "Facility Manager" : "Recycler"}
                  </p>
                </div>

                <div className="w-10 h-10 rounded-full bg-blue-600 group-hover:bg-blue-500 text-white flex items-center justify-center font-bold border-2 border-gray-700 transition-colors shadow-md">
                  {user.initial}
                </div>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-12 w-48 bg-gray-700 rounded-md shadow-xl border border-gray-600 py-1 overflow-hidden z-50">
                  <div className="px-4 py-2 border-b border-gray-600 md:hidden">
                    <p className="text-white font-bold text-sm">{user.name}</p>
                  </div>

                  {user.type === "facility" ? (
                    <Link
                      to="/facility-dashboard"
                      className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 hover:text-white"
                    >
                      Dashboard
                    </Link>
                  ) : (
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 hover:text-white"
                    >
                      My Dashboard
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-600 hover:text-red-300"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-gray-300 hover:text-white font-semibold"
              >
                User Login
              </Link>
              <span className="text-gray-600">|</span>
              <Link
                to="/facility/login"
                className="border border-yellow-500 text-yellow-400 px-3 py-1 rounded hover:bg-yellow-500 hover:text-gray-900 transition-all text-sm font-bold"
              >
                Facility Portal
              </Link>
            </div>
          )}
        </div>
      </div>

      {dropdownOpen && (
        <div
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => setDropdownOpen(false)}
        ></div>
      )}
    </nav>
  );
};

export default Navbar;
