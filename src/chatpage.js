import { useState } from "react";

const ChatPage = () => {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { id: 1, text: "Welcome to FaithTalk! How can I help you today?", sender: "bot" }
  ]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    // Add user message to chat
    const userMessage = { id: Date.now(), text: message, sender: "user" };
    setChatHistory([...chatHistory, userMessage]);
    
    // Simulate bot response (in a real app, this would be an API call)
    setTimeout(() => {
      const botResponse = { 
        id: Date.now() + 1, 
        text: "Thank you for your message. This is a simulated response.", 
        sender: "bot" 
      };
      setChatHistory(prev => [...prev, botResponse]);
    }, 1000);
    
    setMessage("");
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-blue-700 text-white p-4">
        <h2 className="text-2xl font-bold">FaithTalk Chat</h2>
      </div>
      
      <div className="h-[60vh] overflow-y-auto p-4 bg-gray-50">
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
      </div>
      
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
        <div className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your message..."
          />
          <button 
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-200"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPage;
