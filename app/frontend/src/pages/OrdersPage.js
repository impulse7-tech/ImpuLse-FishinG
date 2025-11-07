import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const BACKEND_URL =
    process.env.REACT_APP_BACKEND_URL || 'https://impulse-fishing-api.onrender.com';
  const API = `${BACKEND_URL}/api`;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      loadOrders();
    }
    // eslint-disable-next-line
  }, [isAuthenticated]);

  const loadOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('⚠️ No auth token found, redirecting to login.');
        navigate('/login');
        return;
      }

      const response = await axios.get(`${API}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Ако бекендът върне поръчките като обект -> конвертираме в масив
      const ordersData = Array.isArray(response.data)
        ? response.data
        : response.data.orders || [];

      setOrders(ordersData);
    } catch (error) {
      console.error('❌ Error loading orders:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ff9900',
      confirmed: '#00b2ff',
      shipped: '#9966ff',
      delivered: '#00ff00',
      cancelled: '#ff0000'
    };
    return colors[status] || '#888';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Изчакваща',
      confirmed: 'Потвърдена',
      shipped: 'Изпратена',
      delivered: 'Доставена',
      cancelled: 'Отказана'
    };
    return texts[status] || status;
  };

  if (loading) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '100px',
          color: '#00b2ff',
          fontSize: '24px'
        }}
      >
        ⏳ Зареждане на вашите поръчки...
      </div>
    );
  }

  return (
    <div className="container" style={{ animation: 'fadeIn 0.4s ease-in-out' }}>
      <h1
        style={{
          color: '#00b2ff',
          marginBottom: '30px',
          fontSize: '36px',
          textAlign: 'center'
        }}
      >
        📦 Моите поръчки
      </h1>

      {orders.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '100px 20px',
            color: '#888'
          }}
        >
          <div style={{ fontSize: '80px', marginBottom: '20px' }}>📦</div>
          <h2>Нямате направени поръчки</h2>
          <button
            onClick={() => navigate('/products')}
            className="btn btn-primary"
            style={{ marginTop: '20px', padding: '10px 25px', fontSize: '16px' }}
          >
            🛍️ Разгледай продукти
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orders.map((order) => (
            <div
              key={order.id || order._id}
              style={{
                padding: '25px',
                backgroundColor: '#222',
                borderRadius: '10px',
                border: '2px solid #00b2ff'
              }}
            >
              {/* Заглавна част */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '15px',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}
              >
                <div>
                  <h3
                    style={{ color: '#00b2ff', marginBottom: '5px' }}
                  >{`Поръчка #${(order.id || order._id).substring(0, 8)}`}</h3>
                  <div style={{ color: '#888', fontSize: '14px' }}>
                    {new Date(order.created_at).toLocaleDateString('bg-BG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>

                <div
                  style={{
                    padding: '8px 15px',
                    backgroundColor: getStatusColor(order.status),
                    color: '#000',
                    borderRadius: '5px',
                    fontWeight: 'bold',
                    alignSelf: 'flex-start'
                  }}
                >
                  {getStatusText(order.status)}
                </div>
              </div>

              {/* Адрес за доставка */}
              <div
                style={{
                  marginBottom: '15px',
                  paddingBottom: '15px',
                  borderBottom: '1px solid #444'
                }}
              >
                <div style={{ color: '#888', marginBottom: '5px' }}>
                  Доставка до:
                </div>
                <div style={{ color: '#fff' }}>
                  {order.shipping_name}
                  <br />
                  {order.shipping_address}, {order.shipping_city}
                  <br />
                  {order.shipping_phone}
                </div>
              </div>

              {/* Продукти */}
              <div style={{ marginBottom: '15px' }}>
                <div
                  style={{
                    color: '#00b2ff',
                    marginBottom: '10px',
                    fontWeight: 'bold'
                  }}
                >
                  Продукти:
                </div>

                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '8px 0',
                      borderBottom:
                        idx < order.items.length - 1
                          ? '1px solid #333'
                          : 'none'
                    }}
                  >
                    <div style={{ color: '#fff' }}>
                      {item.product_name} × {item.quantity}
                    </div>
                    <div
                      style={{
                        color: '#ff9900',
                        fontWeight: 'bold'
                      }}
                    >
                      {(item.product_price * item.quantity).toFixed(2)}лв.
                    </div>
                  </div>
                ))}
              </div>

              {/* Общо */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '15px',
                  borderTop: '2px solid #00b2ff',
                  fontSize: '20px',
                  fontWeight: 'bold'
                }}
              >
                <span style={{ color: '#00b2ff' }}>Общо:</span>
                <span style={{ color: '#ff9900' }}>
                  {(order.total || 0).toFixed(2)}лв.
                </span>
              </div>

              {/* Бележки */}
              {order.notes && (
                <div
                  style={{
                    marginTop: '15px',
                    padding: '10px',
                    backgroundColor: '#111',
                    borderRadius: '5px'
                  }}
                >
                  <strong style={{ color: '#888' }}>Бележки:</strong>
                  <div style={{ color: '#fff', marginTop: '5px' }}>
                    {order.notes}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
