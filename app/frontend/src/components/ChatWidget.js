import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ChatWidget = () => {
  const [messages, setMessages] = useState([]);
  const [nickname, setNickname] = useState(localStorage.getItem('chatNickname') || '');
  const [nicknameSet, setNicknameSet] = useState(!!localStorage.getItem('chatNickname'));
  const [newMessage, setNewMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false); // Състояние за отваряне/затваряне
  const messagesEndRef = useRef(null);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  const API = `${BACKEND_URL}/api`;

  // 1. ФУНКЦИИ ЗА РАБОТА С ЧАТА
  
  const loadMessages = async () => {
    try {
      const response = await axios.get(`${API}/chat/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSetNickname = () => {
    if (nickname.trim()) {
      localStorage.setItem('chatNickname', nickname);
      setNicknameSet(true);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !nicknameSet) return;

    try {
      await axios.post(`${API}/chat/messages`, {
        nickname,
        message: newMessage
      });
      setNewMessage('');
      loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (nicknameSet) {
        handleSendMessage();
      } else {
        handleSetNickname();
      }
    }
  };

  // 2. useEffects (Polling и Скролиране)

  useEffect(() => {
    if (!isOpen) return;

    loadMessages();
    const interval = setInterval(loadMessages, 5000); 
    return () => clearInterval(interval);
  }, [isOpen]); 

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  // 3. РЕНДИРАНЕ (JSX)
  
  return (
    <div className={`chat-container ${isOpen ? 'open' : 'closed'}`}> 
      
      {/* Иконата за отваряне/затваряне - ВИНАГИ ВИДИМА */}
      <div className="chat-toggle-icon" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '❌' : '💬'} 
      </div>

      {/* Съдържанието на чата - ВИДИМО САМО АКО ЧАТЪТ Е ОТВОРЕН */}
      {isOpen && (
        <div className="chat-content">
          <div className="chat-header">Impulse Chat</div>

          {!nicknameSet ? (
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
