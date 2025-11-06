import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.phone
        });
      }
      navigate('/');
    } catch (err) {
      setError(
        isLogin
          ? 'Невалиден имейл или парола'
          : 'Грешка при регистрация. Имейлът вече съществува.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '500px', marginTop: '50px' }}>
      <div style={{
        padding: '40px',
        backgroundColor: '#222',
        borderRadius: '10px',
        border: '2px solid #00b2ff'
      }}>
        <h1 style={{ color: '#00b2ff', marginBottom: '30px', textAlign: 'center' }}>
          {isLogin ? '🔑 Вход' : '🆕 Регистрация'}
        </h1>

        {error && (
          <div style={{
            padding: '15px',
            backgroundColor: '#ff0000',
            color: '#fff',
            borderRadius: '5px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="form-group">
                <label>Име и фамилия</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Телефон</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Имейл</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Парола</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '15px', fontSize: '18px' }}
            disabled={loading}
          >
            {loading ? 'Зареждане...' : (isLogin ? 'Вход' : 'Регистрация')}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', color: '#888' }}>
          {isLogin ? (
            <>
              Нямате профил?{' '}
              <button
                onClick={() => setIsLogin(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#00b2ff',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Регистрирайте се
              </button>
            </>
          ) : (
            <>
              Вече имате профил?{' '}
              <button
                onClick={() => setIsLogin(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#00b2ff',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Влезте
              </button>
            </>
          )}
        </div>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Link to="/" style={{ color: '#888', textDecoration: 'none' }}>
            ← Назад към началото
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;