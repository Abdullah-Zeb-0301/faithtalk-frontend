import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SignupPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSignup = (e) => {
    e.preventDefault();
    
    // In a real application, you would send the data to a server
    // For now, just store authentication state and redirect
    localStorage.setItem("isAuthenticated", "true");
    alert("Account Created! You are now logged in.");
    navigate("/chat");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <h2 className="text-3xl font-bold text-blue-800 mb-6">Create an Account</h2>
      <form 
        className="p-6 shadow-lg w-full max-w-md bg-white rounded-lg border border-gray-200" 
        onSubmit={handleSignup}
      >
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Full Name</label>
          <input 
            type="text" 
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
            required 
          />
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email</label>
          <input 
            type="email" 
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
            required 
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-700 font-medium mb-2">Password</label>
          <input 
            type="password" 
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
            required 
          />
        </div>
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-200 font-medium">Sign Up</button>
        <p className="mt-4 text-center text-gray-600">
          Already have an account? <span className="text-blue-600 cursor-pointer hover:underline" onClick={() => navigate("/")}>Login</span>
        </p>
      </form>
    </div>
  );
};

export default SignupPage;
