import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';

const HomePage = () => {
  const [discountProducts, setDiscountProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  const API = `${BACKEND_URL}/api`;

  useEffect(() => {
    loadDiscountProducts();
  }, []);

  const loadDiscountProducts = async () => {
    try {
      const response = await axios.get(`${API}/products?discount_only=true`);
      setDiscountProducts(response.data.slice(0, 6));
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    alert('Продуктът е добавен в количката!');
  };

  const calculateDiscountedPrice = (price, discount) => {
    return (price * (1 - discount / 100)).toFixed(2);
  };

  return (
    <div className="container">
      {/* Hero Section */}
      <div style={{
        textAlign: 'center',
        padding: '60px 20px',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
        borderRadius: '15px',
        margin: '20px 0',
        border: '2px solid #00b2ff'
      }}>
        <h1 style={{
          fontSize: '48px',
          marginBottom: '20px',
          color: '#00b2ff',
          textShadow: '0 0 10px rgba(0, 178, 255, 0.5)'
        }}>
          Добре дошли в ImpuLse FishinG
        </h1>
        <p style={{
          fontSize: '20px',
          marginBottom: '30px',
          color: '#fff'
        }}>
          Вашият най-добър партньор за риболовна екипировка
        </p>
        <Link to="/products" className="btn btn-primary" style={{ fontSize: '18px', padding: '15px 30px' }}>
          Разгледай продуктите
        </Link>
      </div>

      {/* Ad Banner */}
      <div style={{
        width: '100%',
        maxWidth: '970px',
        height: '90px',
        margin: '30px auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#222',
        color: '#00b2ff',
        fontWeight: 'bold',
        border: '2px solid #00b2ff',
        borderRadius: '6px',
        fontSize: '24px'
      }}>
        🎯 Място за реклама!
      </div>

      {/* Discount Products Section */}
      {discountProducts.length > 0 && (
        <div style={{ marginTop: '40px' }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            <div style={{
              display: 'inline-block',
              backgroundColor: '#111',
              color: '#00b2ff',
              padding: '10px 20px',
              border: '2px solid #00b2ff',
              borderRadius: '6px',
              fontWeight: 'bold',
              fontSize: '20px'
            }}>
              💸 Намалени артикули
            </div>
          </div>

          {loading ? (
            <div className="loading">Зареждане...</div>
          ) : (
            <div className="grid grid-3">
              {discountProducts.map((product) => (
                <div key={product.id} className="product-card" style={{ position: 'relative' }}>
                  {product.discount_percentage > 0 && (
                    <div className="discount-badge">-{product.discount_percentage}%</div>
                  )}
                  <img src={product.image_url} alt={product.name} />
                  <div className="product-info">
                    <div className="product-name">{product.name}</div>
                    <div className="product-price">
                      {product.discount_percentage > 0 && (
                        <span className="product-old-price">
                          {product.price.toFixed(2)}лв.
                        </span>
                      )}
                      {calculateDiscountedPrice(product.price, product.discount_percentage)}лв. / 
                      {calculateDiscountedPrice(product.price_eur, product.discount_percentage)}€
                    </div>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="btn btn-secondary"
                      style={{ width: '100%', marginTop: '10px' }}
                    >
                      🛒 Добави в количка
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Features Section */}
      <div className="grid grid-3" style={{ marginTop: '60px', gap: '30px' }}>
        <div style={{
          textAlign: 'center',
          padding: '30px',
          backgroundColor: '#222',
          borderRadius: '10px',
          border: '2px solid #00b2ff'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>🚚</div>
          <h3 style={{ color: '#00b2ff', marginBottom: '10px' }}>Бърза доставка</h3>
          <p style={{ color: '#ccc' }}>Доставка в цялата страна</p>
        </div>
        <div style={{
          textAlign: 'center',
          padding: '30px',
          backgroundColor: '#222',
          borderRadius: '10px',
          border: '2px solid #00b2ff'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>💵</div>
          <h3 style={{ color: '#00b2ff', marginBottom: '10px' }}>Наложен платеж</h3>
          <p style={{ color: '#ccc' }}>Плащаш при получаване</p>
        </div>
        <div style={{
          textAlign: 'center',
          padding: '30px',
          backgroundColor: '#222',
          borderRadius: '10px',
          border: '2px solid #00b2ff'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>⭐</div>
          <h3 style={{ color: '#00b2ff', marginBottom: '10px' }}>Качествени продукти</h3>
          <p style={{ color: '#ccc' }}>Само проверени брандове</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;