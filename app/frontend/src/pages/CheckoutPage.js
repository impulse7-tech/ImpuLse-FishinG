import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const CheckoutPage = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Ако няма продукти — връща обратно в количката
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  const [formData, setFormData] = useState({
    shipping_name: user?.name || '',
    shipping_phone: user?.phone || '',
    shipping_address: user?.address || '',
    shipping_city: '',
    shipping_postal_code: '',
    notes: ''
  });

  const BACKEND_URL =
    process.env.REACT_APP_BACKEND_URL || 'https://impulse-fishing-api.onrender.com';
  const API = `${BACKEND_URL}/api`;

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const calculateDiscountedPrice = (price, discount) =>
    Math.round(price * (1 - discount / 100) * 100) / 100;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!cartItems.length) {
        alert('❌ Количката е празна.');
        return;
      }

      if (!isAuthenticated) {
        alert('🔒 Моля, влезте в профила си, за да направите поръчка.');
        navigate('/login');
        return;
      }

      const orderItems = cartItems.map((item) => ({
        product_id: item.id,
        product_name: item.name,
        product_price: calculateDiscountedPrice(
          item.price,
          item.discount_percentage
        ),
        quantity: item.quantity
      }));

      const orderData = {
        items: orderItems,
        ...formData
      };

      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const endpoint = isAuthenticated
        ? `${API}/orders`
        : `${API}/orders/guest`;

      await axios.post(endpoint, orderData, { headers });

      alert('✅ Поръчката е приета успешно! Ще се свържем с вас скоро.');
      clearCart();
      navigate('/');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('❌ Грешка при поръчката. Моля, опитайте отново.');
    } finally {
      setLoading(false);
    }
  };

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
        📦 Завършване на поръчка
      </h1>

      <div className="grid grid-2" style={{ gap: '30px', alignItems: 'start' }}>
        {/* 📋 Checkout Form */}
        <div
          style={{
            padding: '30px',
            backgroundColor: '#222',
            borderRadius: '10px',
            border: '2px solid #00b2ff'
          }}
        >
          <h2 style={{ color: '#00b2ff', marginBottom: '20px' }}>
            Данни за доставка
          </h2>

          <form onSubmit={handleSubmit}>
            {[
              { label: 'Име и фамилия *', name: 'shipping_name', type: 'text', required: true },
              { label: 'Телефон *', name: 'shipping_phone', type: 'tel', required: true },
              { label: 'Адрес *', name: 'shipping_address', type: 'text', required: true },
              { label: 'Град *', name: 'shipping_city', type: 'text', required: true },
              { label: 'Пощенски код', name: 'shipping_postal_code', type: 'text' }
            ].map((field) => (
              <div className="form-group" key={field.name}>
                <label>{field.label}</label>
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  required={field.required}
                  disabled={loading}
                />
              </div>
            ))}

            <div className="form-group">
              <label>Бележки към поръчката</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                disabled={loading}
              />
            </div>

            <div
              style={{
                padding: '15px',
                backgroundColor: '#111',
                borderRadius: '5px',
                border: '2px solid #00b2ff',
                marginBottom: '20px'
              }}
            >
              <strong style={{ color: '#00b2ff' }}>Метод на плащане:</strong>
              <div
                style={{
                  color: '#ff9900',
                  marginTop: '5px',
                  fontSize: '18px'
                }}
              >
                💵 Наложен платеж (плащане при доставка)
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '15px', fontSize: '18px' }}
              disabled={loading}
            >
              {loading ? '⏳ Изпращане...' : '✅ Потвърди поръчката'}
            </button>
          </form>
        </div>

        {/* 🧾 Order Summary */}
        <div
          style={{
            padding: '30px',
            backgroundColor: '#222',
            borderRadius: '10px',
            border: '2px solid #00b2ff',
            position: 'sticky',
            top: '100px'
          }}
        >
          <h2 style={{ color: '#00b2ff', marginBottom: '20px' }}>
            Вашата поръчка
          </h2>

          {cartItems.map((item) => {
            const itemPrice = calculateDiscountedPrice(
              item.price,
              item.discount_percentage
            );
            return (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                  paddingBottom: '10px',
                  borderBottom: '1px solid #444',
                  color: '#fff'
                }}
              >
                <div>
                  <div>{item.name}</div>
                  <div style={{ fontSize: '14px', color: '#888' }}>
                    {itemPrice.toFixed(2)}лв. × {item.quantity}
                  </div>
                </div>
                <div style={{ fontWeight: 'bold', color: '#ff9900' }}>
                  {(itemPrice * item.quantity).toFixed(2)}лв.
                </div>
              </div>
            );
          })}

          <div
            style={{
              marginTop: '20px',
              paddingTop: '20px',
              borderTop: '2px solid #00b2ff',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '24px',
              fontWeight: 'bold'
            }}
          >
            <span style={{ color: '#00b2ff' }}>Общо:</span>
            <span style={{ color: '#ff9900' }}>{cartTotal.toFixed(2)}лв.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
