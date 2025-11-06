import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const CheckoutPage = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    shipping_name: user?.name || '',
    shipping_phone: user?.phone || '',
    shipping_address: user?.address || '',
    shipping_city: '',
    shipping_postal_code: '',
    notes: ''
  });

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  const API = `${BACKEND_URL}/api`;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const calculateDiscountedPrice = (price, discount) => {
    return price * (1 - discount / 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderItems = cartItems.map(item => ({
        product_id: item.id,
        product_name: item.name,
        product_price: calculateDiscountedPrice(item.price, item.discount_percentage),
        quantity: item.quantity
      }));

      const orderData = {
        items: orderItems,
        ...formData
      };

      let endpoint = `${API}/orders`;
      let headers = {};

      if (isAuthenticated && user) {
        const token = localStorage.getItem('token');
        headers = { Authorization: `Bearer ${token}` };
      } else {
        endpoint = `${API}/orders/guest`;
      }

      await axios.post(endpoint, orderData, { headers });

      alert('✅ Поръчката е приета успешно! Ще се свържем с вас скоро.');
      clearCart();
      navigate('/');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('❌ Грешка при поръчката. Моля опитайте отново.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="container">
      <h1 style={{ color: '#00b2ff', marginBottom: '30px', fontSize: '36px' }}>
        📦 Завършване на поръчка
      </h1>

      <div className="grid grid-2" style={{ gap: '30px', alignItems: 'start' }}>
        {/* Checkout Form */}
        <div style={{
          padding: '30px',
          backgroundColor: '#222',
          borderRadius: '10px',
          border: '2px solid #00b2ff'
        }}>
          <h2 style={{ color: '#00b2ff', marginBottom: '20px' }}>Данни за доставка</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Име и фамилия *</label>
              <input
                type="text"
                name="shipping_name"
                value={formData.shipping_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Телефон *</label>
              <input
                type="tel"
                name="shipping_phone"
                value={formData.shipping_phone}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Адрес *</label>
              <input
                type="text"
                name="shipping_address"
                value={formData.shipping_address}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Град *</label>
              <input
                type="text"
                name="shipping_city"
                value={formData.shipping_city}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Пощенски код</label>
              <input
                type="text"
                name="shipping_postal_code"
                value={formData.shipping_postal_code}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Бележки към поръчката</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
              />
            </div>

            <div style={{
              padding: '15px',
              backgroundColor: '#111',
              borderRadius: '5px',
              border: '2px solid #00b2ff',
              marginBottom: '20px'
            }}>
              <strong style={{ color: '#00b2ff' }}>Метод на плащане:</strong>
              <div style={{ color: '#ff9900', marginTop: '5px', fontSize: '18px' }}>
                💵 Наложен платеж (плащане при доставка)
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '15px', fontSize: '18px' }}
              disabled={loading}
            >
              {loading ? 'Изпращане...' : '✅ Потвърди поръчката'}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div style={{
          padding: '30px',
          backgroundColor: '#222',
          borderRadius: '10px',
          border: '2px solid #00b2ff',
          position: 'sticky',
          top: '100px'
        }}>
          <h2 style={{ color: '#00b2ff', marginBottom: '20px' }}>Вашата поръчка</h2>
          {cartItems.map((item) => {
            const itemPrice = calculateDiscountedPrice(item.price, item.discount_percentage);
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
          <div style={{
            marginTop: '20px',
            paddingTop: '20px',
            borderTop: '2px solid #00b2ff',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '24px',
            fontWeight: 'bold'
          }}>
            <span style={{ color: '#00b2ff' }}>Общо:</span>
            <span style={{ color: '#ff9900' }}>{cartTotal.toFixed(2)}лв.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;