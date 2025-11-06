import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  const API = `${BACKEND_URL}/api`;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadOrders();
  }, [isAuthenticated]);

  const loadOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error loading orders:', error);
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
    return <div className="loading">Зареждане...</div>;
  }

  return (
    <div className="container">
      <h1 style={{ color: '#00b2ff', marginBottom: '30px', fontSize: '36px' }}>
        📦 Моите поръчки
      </h1>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '100px 20px', color: '#888' }}>
          <div style={{ fontSize: '80px', marginBottom: '20px' }}>📦</div>
          <h2>Нямате направени поръчки</h2>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orders.map((order) => (
            <div
              key={order.id}
              style={{
                padding: '25px',
                backgroundColor: '#222',
                borderRadius: '10px',
                border: '2px solid #00b2ff'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 style={{ color: '#00b2ff', marginBottom: '5px' }}>
                    Поръчка #{order.id.substring(0, 8)}
                  </h3>
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
                <div style={{
                  padding: '8px 15px',
                  backgroundColor: getStatusColor(order.status),
                  color: '#000',
                  borderRadius: '5px',
                  fontWeight: 'bold',
                  alignSelf: 'flex-start'
                }}>
                  {getStatusText(order.status)}
                </div>
              </div>

              <div style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #444' }}>
                <div style={{ color: '#888', marginBottom: '5px' }}>Доставка до:</div>
                <div style={{ color: '#fff' }}>
                  {order.shipping_name}<br />
                  {order.shipping_address}, {order.shipping_city}<br />
                  {order.shipping_phone}
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <div style={{ color: '#00b2ff', marginBottom: '10px', fontWeight: 'bold' }}>
                  Продукти:
                </div>
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '8px 0',
                      borderBottom: idx < order.items.length - 1 ? '1px solid #333' : 'none'
                    }}
                  >
                    <div style={{ color: '#fff' }}>
                      {item.product_name} × {item.quantity}
                    </div>
                    <div style={{ color: '#ff9900', fontWeight: 'bold' }}>
                      {(item.product_price * item.quantity).toFixed(2)}лв.
                    </div>
                  </div>
                ))}
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '15px',
                borderTop: '2px solid #00b2ff',
                fontSize: '20px',
                fontWeight: 'bold'
              }}>
                <span style={{ color: '#00b2ff' }}>Общо:</span>
                <span style={{ color: '#ff9900' }}>{order.total.toFixed(2)}лв.</span>
              </div>

              {order.notes && (
                <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#111', borderRadius: '5px' }}>
                  <strong style={{ color: '#888' }}>Бележки:</strong>
                  <div style={{ color: '#fff', marginTop: '5px' }}>{order.notes}</div>
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