import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ChatWidget = () => {
  const [messages, setMessages] = useState([]);
  const [nickname, setNickname] = useState(localStorage.getItem('chatNickname') || '');
  const [nicknameSet, setNicknameSet] = useState(!!localStorage.getItem('chatNickname'));
  const [newMessage, setNewMessage] = useState('');
  // Добавяме ново състояние за видимост
  const [isOpen, setIsOpen] = useState(false); 
  const messagesEndRef = useRef(null);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  const API = `${BACKEND_URL}/api`;

  // Зареждане и Polling се изпълняват само ако чатът е отворен
  useEffect(() => {
    if (!isOpen) return;

    loadMessages();
    const interval = setInterval(loadMessages, 5000); 
    return () => clearInterval(interval);
  }, [isOpen]); // Зависи от 'isOpen'

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    if (!newMessage.trim()) return;

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

  return (
    // Добавяме клас 'minimized' за контрол със CSS
    <div className={`chat-container ${isOpen ? 'open' : 'minimized'}`}> 
      
      {/* Бутон/Заглавие, което отваря/затваря чата */}
      <div className="chat-toggle-header" onClick={() => setIsOpen(!isOpen)}>
        💬 Чат на Живо {isOpen ? ' (Скрий)' : ' (Отвори)'}
      </div>

      {/* Цялото съдържание на чата се рендира само ако 'isOpen' е true */}
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
