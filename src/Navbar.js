import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import authService from "./api/authService";

const Navbar = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    // Check authentication status when component mounts
    const checkAuth = () => {
      const isAuth = authService.isAuthenticated();
      setIsAuthenticated(isAuth);
      
      if (isAuth) {
        setUser(authService.getUser());
      } else {
        setUser(null);
      }
    };
    
    checkAuth();
    
    // Create a custom event for auth changes
    window.addEventListener("auth-change", checkAuth);
    
    return () => {
      window.removeEventListener("auth-change", checkAuth);
    };
  }, []);
  
  const handleLogout = () => {
    authService.clearAuthData();
    setIsAuthenticated(false);
    setUser(null);
    navigate("/");
    // Dispatch event to notify other components about auth change
    window.dispatchEvent(new Event("auth-change"));
  };

  return (
    <nav className="bg-blue-700 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-bold">FaithTalk</div>
        <div className="flex items-center space-x-4">
          <Link to="/api-test" className="hover:text-yellow-200 transition duration-200 bg-yellow-600 px-3 py-1 rounded">API Tester</Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/chat" className="hover:text-blue-200 transition duration-200">Chat</Link>
              {user && user.role === 'admin' && (
                <Link to="/admin-login" className="hover:text-blue-200 transition duration-200">Admin Panel</Link>
              )}
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
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
