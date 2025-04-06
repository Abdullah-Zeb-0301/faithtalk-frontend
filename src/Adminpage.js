import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  // Mock user data for admin panel
  const [users, setUsers] = useState([
    { id: 1, name: "John Doe", email: "john@example.com", lastActive: "2025-04-05" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", lastActive: "2025-04-04" },
    { id: 3, name: "Mike Johnson", email: "mike@example.com", lastActive: "2025-04-06" },
  ]);
  
  // Check if admin is logged in
  useEffect(() => {
    const adminAuth = localStorage.getItem("adminAuthenticated") === "true";
    setIsAdminLoggedIn(adminAuth);
  }, []);
  
  const handleAdminLogin = (e) => {
    e.preventDefault();
    
    // Admin validation
    if (email === "admin@example.com" && password === "admin123") {
      localStorage.setItem("adminAuthenticated", "true");
      setIsAdminLoggedIn(true);
      setError("");
    } else {
      setError("Invalid admin credentials");
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem("adminAuthenticated");
    setIsAdminLoggedIn(false);
  };
  
  const handleDeleteUser = (id) => {
    setUsers(users.filter(user => user.id !== id));
  };
  
  // Admin login form
  const loginForm = (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <h2 className="text-3xl font-bold text-blue-800 mb-6">Admin Login</h2>
      <form 
        className="p-6 shadow-lg w-full max-w-md bg-white rounded-lg border border-gray-200" 
        onSubmit={handleAdminLogin}
      >
        <div className="mb-4">
          <label htmlFor="admin-email" className="block text-gray-700 font-medium mb-2">Admin Email</label>
          <input 
            type="email" 
            id="admin-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
            required 
          />
        </div>
        <div className="mb-6">
          <label htmlFor="admin-password" className="block text-gray-700 font-medium mb-2">Admin Password</label>
          <input 
            type="password" 
            id="admin-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
            required 
          />
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-200 font-medium">
          Login as Admin
        </button>
        <p className="mt-4 text-center text-gray-600">
          Back to <span className="text-blue-600 cursor-pointer hover:underline" onClick={() => navigate("/")}>User Login</span>
        </p>
      </form>
    </div>
  );
  
  // Admin dashboard
  const adminDashboard = (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-blue-800">Admin Dashboard</h2>
        <button 
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition duration-200"
        >
          Logout
        </button>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-4 bg-blue-700 text-white font-medium">
          <h3 className="text-xl">User Management</h3>
        </div>
        
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map(user => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.lastActive}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button 
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {users.length === 0 && (
          <div className="text-center p-4 text-gray-500">No users found</div>
        )}
      </div>
      
      <div className="mt-8 bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-4 bg-blue-700 text-white font-medium">
          <h3 className="text-xl">System Statistics</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <p className="text-4xl font-bold text-blue-800">{users.length}</p>
            <p className="text-gray-600">Total Users</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <p className="text-4xl font-bold text-green-800">24</p>
            <p className="text-gray-600">Active Conversations</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <p className="text-4xl font-bold text-purple-800">98%</p>
            <p className="text-gray-600">User Satisfaction</p>
          </div>
        </div>
      </div>
    </div>
  );
  
  return isAdminLoggedIn ? adminDashboard : loginForm;
};

export default AdminLoginPage;