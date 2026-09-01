'use client';
import React, { useState } from 'react';
import './chatbot.css'

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const sendMessage = async () => {
    if (userInput.trim() === '') return;

    const prompt = userInput.trim();
    const userMessage = { text: prompt, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setUserInput('');
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: prompt })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to contact the assistant");
      }

      const botMessage = { text: data.reply, sender: 'bot' };
      setMessages((prev) => [...prev, botMessage]);
    } catch {
      const errorMessage = { text: 'Failed to contact the assistant. Please try again.', sender: 'bot' };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div>
      <button id="chatbot-button" onClick={toggleChat}>💬</button>

      {isOpen && (
        <div id="chat-container">
          <div id="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
          </div>
          <div id="chat-input">
            <input
              type="text"
              id="user-input"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Ask about crops..."
            />
            <button onClick={sendMessage} disabled={isSending} aria-label="Send message">
              {isSending ? '…' : '➤'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
