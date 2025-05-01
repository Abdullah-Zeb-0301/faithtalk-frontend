import { Routes, Route } from "react-router-dom";
import Navbar from "./Navbar";
import LoginPage from "./Loginpage";
import SignupPage from "./Signup_page";
import ChatPage from "./chatpage";
import AdminLoginPage from "./Adminpage";
import ProtectedRoute from "./ProtectedRoute";
import ApiTester from "./ApiTester";

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/chat" element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          } />
          <Route path="/admin-login" element={<AdminLoginPage />} />
          <Route path="/api-test" element={<ApiTester />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
