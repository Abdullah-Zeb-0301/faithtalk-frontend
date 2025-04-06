import { useNavigate } from "react-router-dom";
import { useState } from "react";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    
    if (email === "admin@example.com" && password === "admin123") {
      navigate("/admin-login");
    } else {
      // In a real application, you would validate credentials against a server
      // For now, we'll just simulate a successful login
      localStorage.setItem("isAuthenticated", "true");
      navigate("/chat");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <h2 className="text-3xl font-bold text-blue-800 mb-6">Login to FaithTalk</h2>
      <form 
        className="p-6 shadow-lg w-full max-w-md bg-white rounded-lg border border-gray-200" 
        onSubmit={handleLogin}
      >
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
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-200 font-medium">Login</button>
        <p className="mt-4 text-center text-gray-600">
          Don't have an account? <span className="text-blue-600 cursor-pointer hover:underline" onClick={() => navigate("/signup")}>Sign up</span>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
