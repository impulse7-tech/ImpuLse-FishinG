import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ChatWidget = () => {
  // ... (Останалите useState, useEffect, handle функции остават непроменени) ...
  const [messages, setMessages] = useState([]);
  const [nickname, setNickname] = useState(localStorage.getItem('chatNickname') || '');
  const [nicknameSet, setNicknameSet] = useState(!!localStorage.getItem('chatNickname'));
  const [newMessage, setNewMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false); // Състояние за отваряне/затваряне
  const messagesEndRef = useRef(null);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  const API = `${BACKEND_URL}/api`;

  // ... (loadMessages, handleSetNickname, handleSendMessage, handleKeyPress остават непроменени) ...
  // ... (useEffect за Polling и useEffect за скрол остават непроменени) ...

  return (
    <div className={`chat-container ${isOpen ? 'open' : 'closed'}`}> 
      
      {/* 1. Бутонът/Иконата за отваряне/затваряне */}
      <div className="chat-toggle-icon" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '❌' : '💬'} 
      </div>

      {/* 2. Съдържанието на чата - рендира се само при отваряне */}
      {isOpen && (
        <div className="chat-content">
          <div className="chat-header">Impulse Chat</div>

          {!nicknameSet ? (
            // ... (Код за въвеждане на прякор) ...
            <div style={{ padding: '20px' }}>
              <label style={{ color: '#00b2ff', marginBottom: '10px', display: 'block' }}>
                Въведи прякор:
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Твоят прякор..."
                style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #00b2ff', backgroundColor: '#111', color: '#fff' }}
              />
              <button onClick={handleSetNickname} className="btn btn-primary" style={{ width: '100%' }}>
                Потвърди
              </button>
            </div>
          ) : (
            <>
              <div className="chat-messages">
                {messages.map((msg) => (
                  <div key={msg.id} className="chat-message">
                    <strong>{msg.nickname}:</strong> {msg.message}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="chat-input-area">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Напиши съобщение..."
                />
                <button onClick={handleSendMessage}>📤</button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
