import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const Navbar = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    // Check authentication status when component mounts and when localStorage changes
    const checkAuth = () => {
      setIsAuthenticated(localStorage.getItem("isAuthenticated") === "true");
    };
    
    checkAuth();
    
    // Listen for storage events (e.g., when another tab changes localStorage)
    window.addEventListener("storage", checkAuth);
    
    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    setIsAuthenticated(false);
    navigate("/");
  };

  return (
    <nav className="bg-blue-700 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-bold">FaithTalk</div>
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <Link to="/chat" className="hover:text-blue-200 transition duration-200">Chat</Link>
              <button 
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white transition duration-200"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/" className="hover:text-blue-200 transition duration-200">Login</Link>
              <Link to="/signup" className="hover:text-blue-200 transition duration-200">Signup</Link>
              <Link to="/admin-login" className="hover:text-blue-200 transition duration-200">Admin</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
