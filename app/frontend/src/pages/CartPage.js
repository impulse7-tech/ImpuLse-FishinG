import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const calculateDiscountedPrice = (price, discount) => {
    return price * (1 - discount / 100);
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
        <div style={{ fontSize: '80px', marginBottom: '20px' }}>🛒</div>
        <h2 style={{ color: '#00b2ff', marginBottom: '15px' }}>
          Количката е празна
        </h2>
        <p style={{ color: '#888', marginBottom: '30px' }}>
          Добавете продукти, за да продължите
        </p>
        <Link to="/products" className="btn btn-primary" style={{ padding: '15px 30px', fontSize: '18px' }}>
          Разгледай продуктите
        </Link>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 style={{ color: '#00b2ff', marginBottom: '30px', fontSize: '36px' }}>
        🛒 Вашата количка
      </h1>

      <div className="grid grid-2" style={{ gap: '30px', alignItems: 'start' }}>
        {/* Cart Items */}
        <div>
          {cartItems.map((item) => {
            const itemPrice = calculateDiscountedPrice(item.price, item.discount_percentage);
            const itemTotal = itemPrice * item.quantity;

            return (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  gap: '15px',
                  padding: '20px',
                  backgroundColor: '#222',
                  borderRadius: '10px',
                  marginBottom: '15px',
                  border: '2px solid #00b2ff'
                }}
              >
                <img
                  src={item.image_url}
                  alt={item.name}
                  style={{
                    width: '100px',
                    height: '100px',
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }}
                />
                <div style={{ flex: 1 }}>
                  <h3 style={{ color: '#fff', marginBottom: '8px' }}>{item.name}</h3>
                  <div style={{ color: '#ff9900', marginBottom: '10px', fontSize: '18px', fontWeight: 'bold' }}>
                    {itemPrice.toFixed(2)}лв. × {item.quantity} = {itemTotal.toFixed(2)}лв.
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="btn btn-secondary"
                      style={{ padding: '5px 15px' }}
                    >
                      -
                    </button>
                    <span style={{ color: '#fff', fontWeight: 'bold', minWidth: '30px', textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="btn btn-secondary"
                      style={{ padding: '5px 15px' }}
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="btn btn-danger"
                      style={{ marginLeft: 'auto' }}
                    >
                      🗑️ Премахни
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          <button
            onClick={clearCart}
            className="btn btn-danger"
            style={{ width: '100%', marginTop: '10px' }}
          >
            🗑️ Изчисти количката
          </button>
        </div>

        {/* Order Summary */}
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
          <h2 style={{ color: '#00b2ff', marginBottom: '20px' }}>Обобщение</h2>
          <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', color: '#fff' }}>
            <span>Продукти:</span>
            <span>{cartItems.length}</span>
          </div>
          <div style={{ marginBottom: '20px', paddingTop: '15px', borderTop: '1px solid #444' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '24px', fontWeight: 'bold' }}>
              <span style={{ color: '#00b2ff' }}>Общо:</span>
              <span style={{ color: '#ff9900' }}>{cartTotal.toFixed(2)}лв.</span>
            </div>
          </div>
          <button
            onClick={handleCheckout}
            className="btn btn-primary"
            style={{ width: '100%', padding: '15px', fontSize: '18px' }}
          >
            📦 Продължи към поръчка
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;