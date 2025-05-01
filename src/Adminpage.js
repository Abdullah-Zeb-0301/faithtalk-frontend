import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import adminService from "./api/adminService";
import authService from "./api/authService";

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  
  useEffect(() => {
    // Check if user is authenticated and is an admin
    const user = authService.getUser();
    if (!user || user.role !== 'admin') {
      // Redirect non-admin users to the home page
      navigate("/");
      return;
    }
    
    // Fetch users data
    fetchUsers();
  }, [navigate]);
  
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await adminService.getAllUsers();
      setUsers(response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users: " + (err.response?.data?.message || "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLogout = () => {
    authService.clearAuthData();
    navigate("/");
    // Dispatch event to notify other components about auth change
    window.dispatchEvent(new Event("auth-change"));
  };
  
  const handleDeleteUser = async (userId) => {
    try {
      await adminService.deleteUser(userId);
      // Update the local state after successful deletion
      setUsers(users.filter(user => user.id !== userId));
    } catch (err) {
      console.error("Error deleting user:", err);
      setError("Failed to delete user: " + (err.response?.data?.message || "Unknown error"));
    }
  };
  
  const handleUpdateRole = async (userId, newRole) => {
    try {
      await adminService.updateUserRole(userId, newRole);
      // Update user in the local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
    } catch (err) {
      console.error("Error updating user role:", err);
      setError("Failed to update user role: " + (err.response?.data?.message || "Unknown error"));
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="text-blue-800 text-xl">Loading admin panel...</div>
      </div>
    );
  }
  
  return (
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
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-4 bg-blue-700 text-white font-medium">
          <h3 className="text-xl">User Management</h3>
        </div>
        
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map(user => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">{user.username}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={user.role}
                    onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
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
            <p className="text-4xl font-bold text-green-800">-</p>
            <p className="text-gray-600">Active Conversations</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <p className="text-4xl font-bold text-purple-800">-</p>
            <p className="text-gray-600">API Requests Today</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;