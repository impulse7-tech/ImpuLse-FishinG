import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Header = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [dateTime, setDateTime] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const day = now.getDate().toString().padStart(2, '0');
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const year = now.getFullYear();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      const weekdays = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
      setDateTime(`${weekdays[now.getDay()]}, ${day}.${month}.${year} ${hours}:${minutes}:${seconds}`);
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  return (
    <div className="top-bar">
      <div className="logo-container">
        <Link to="/" className="logo-text">
          ImpuLse FishinG
        </Link>
        <svg className="fish fish1" viewBox="0 0 24 24" fill="#00b2ff">
          <path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8z" />
        </svg>
        <svg className="fish fish2" viewBox="0 0 24 24" fill="#ff9900">
          <path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8z" />
        </svg>
        <svg className="fish fish3" viewBox="0 0 24 24" fill="#00b2ff">
          <path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8z" />
        </svg>
      </div>

      <div className="date-time">{dateTime}</div>

      <div className="nav-links">
        <Link to="/">Начало</Link>
        <Link to="/products">Продукти</Link>
        <Link to="/cart" className="cart-icon">
          🛒
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </Link>

        {isAuthenticated ? (
          <div className="user-menu">
            <button
              className="user-menu-button"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              {user?.name} ▼
            </button>
            {showUserMenu && (
              <div className="user-menu-dropdown">
                <Link to="/profile" onClick={() => setShowUserMenu(false)}>
                  Профил
                </Link>
                <Link to="/orders" onClick={() => setShowUserMenu(false)}>
                  Поръчки
                </Link>
                {isAdmin && (
                  <Link to="/admin" onClick={() => setShowUserMenu(false)}>
                    Админ
                  </Link>
                )}
                <button onClick={handleLogout}>Изход</button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="btn btn-primary" style={{ padding: '8px 15px' }}>
            Вход
          </Link>
        )}

        <div className="social-icons">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
            📘
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
            📷
          </a>
        </div>
      </div>
    </div>
  );
};

export default Header;