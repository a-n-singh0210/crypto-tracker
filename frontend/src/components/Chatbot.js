import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot } from 'lucide-react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your CryptoVault assistant. How can I help you today?", isBot: true }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { text: input, isBot: false };
    setMessages(prev => [...prev, userMessage]);
    setInput("");

    // Simple mock responses
    setTimeout(() => {
      let botResponse = "I'm still learning! You can ask me about crypto prices, predictions, or your portfolio.";
      const lowerInput = input.toLowerCase();
      
      if (lowerInput.includes("btc") || lowerInput.includes("bitcoin")) {
        botResponse = "Bitcoin (BTC) is the first cryptocurrency. You can check its 7-day prediction in the Analytics tab!";
      } else if (lowerInput.includes("portfolio") || lowerInput.includes("holdings")) {
        botResponse = "Your portfolio shows your current holdings and profit/loss. Use the 'Portfolio' tab to manage your assets.";
      } else if (lowerInput.includes("prediction") || lowerInput.includes("predict")) {
        botResponse = "I use data from 5 different sources (CoinGecko, CMC, etc.) to calculate price predictions. Check the Analytics tab to see them!";
      } else if (lowerInput.includes("market") || lowerInput.includes("trend")) {
        botResponse = "The Market Trends tab shows real-time performance and 7-day price comparisons for the top 5 cryptocurrencies.";
      } else if (lowerInput.includes("price") || lowerInput.includes("cost")) {
        botResponse = "I fetch live prices from CoinGecko. Check the Overview tab for your total balance and current asset values!";
      } else if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
        botResponse = "Hi there! I'm VaultBot. Ready to track some crypto today?";
      } else if (lowerInput.includes("help")) {
        botResponse = "I can help you with your portfolio, price predictions, or market trends. Just ask!";
      }

      setMessages(prev => [...prev, { text: botResponse, isBot: true }]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl transition-all transform hover:scale-110 active:scale-95 flex items-center justify-center"
        >
          <MessageSquare size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-gray-800 w-80 md:w-96 h-[500px] rounded-2xl shadow-2xl border border-gray-700 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-gray-900 p-4 border-b border-gray-700 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-500/10 p-2 rounded-lg text-blue-500">
                <Bot size={20} />
              </div>
              <span className="font-bold text-white">VaultBot</span>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`flex items-start space-x-2 max-w-[80%] ${msg.isBot ? '' : 'flex-row-reverse space-x-reverse'}`}>
                  <div className={`p-2 rounded-lg ${msg.isBot ? 'bg-gray-700 text-gray-100' : 'bg-blue-600 text-white shadow-lg'}`}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-gray-900 border-t border-gray-700">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me something..."
                className="flex-1 bg-gray-800 text-white text-sm rounded-xl px-4 py-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white p-2 rounded-xl transition-all active:scale-95"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
