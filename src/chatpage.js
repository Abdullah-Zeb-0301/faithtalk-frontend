import { useState, useEffect, useRef } from "react";
import llmService from "./api/llmService";
import authService from "./api/authService";

const ChatPage = () => {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { id: 1, text: "Welcome to FaithTalk! How can I help you today?", sender: "bot" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const chatContainerRef = useRef(null);
  
  // Auto-scroll to bottom of chat when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  useEffect(() => {
    // Get the current user
    const currentUser = authService.getUser();
    setUser(currentUser);
  }, []);
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    // Add user message to chat
    const userMessage = { id: Date.now(), text: message, sender: "user" };
    setChatHistory(prevChat => [...prevChat, userMessage]);
    
    const currentMessage = message;
    setMessage(""); // Clear input field immediately after sending
    
    try {
      setIsLoading(true);
      setError("");
      
      // Send the message to the Groq LLM API using the llmService
      const response = await llmService.askGroq(currentMessage);
      
      // Extract the response text according to the API format
      const responseText = response.data.choices[0].message.content;
      
      // Add the bot response to chat
      const botResponse = { 
        id: Date.now() + 1, 
        text: responseText,
        sender: "bot" 
      };
      
      setChatHistory(prevChat => [...prevChat, botResponse]);
    } catch (err) {
      console.error("Error getting LLM response:", err);
      setError("Failed to get response: " + (err.response?.data?.message || "Unknown error"));
      
      // Add an error message to the chat
      const errorMessage = { 
        id: Date.now() + 1, 
        text: "I'm sorry, there was an error processing your message. Please try again.", 
        sender: "bot" 
      };
      setChatHistory(prevChat => [...prevChat, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-blue-700 text-white p-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold">FaithTalk Chat</h2>
        {user && <div className="text-sm">Logged in as: {user.username}</div>}
      </div>
      
      <div 
        ref={chatContainerRef}
        className="h-[60vh] overflow-y-auto p-4 bg-gray-50" 
        id="chat-container"
      >
        {chatHistory.map(msg => (
          <div 
            key={msg.id} 
            className={`mb-4 max-w-[80%] p-3 rounded-lg ${
              msg.sender === "user" 
                ? "ml-auto bg-blue-500 text-white" 
                : "bg-gray-200 text-gray-800"
            }`}
          >
            {msg.text}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center space-x-2 mb-4 max-w-[80%] p-3 rounded-lg bg-gray-200 text-gray-800">
            <div className="animate-pulse">Thinking...</div>
          </div>
        )}
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
        <div className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your message..."
            disabled={isLoading}
          />
          <button 
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-200 disabled:bg-blue-400"
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPage;
