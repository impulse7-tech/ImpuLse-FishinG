import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { addToCart } = useCart();

  // Безопасно задаване на бекенд URL
  const BACKEND_URL =
    process.env.REACT_APP_BACKEND_URL?.trim() ||
    'https://impulse-fishing-api.onrender.com';
  const API = `${BACKEND_URL}/api`;

  const [error, setError] = useState(null);

  useEffect(() => {
    loadCategories();
    loadProducts();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      loadProducts();
    }, 400); // малък debounce за търсенето
    return () => clearTimeout(delaySearch);
    // eslint-disable-next-line
  }, [selectedCategory, searchTerm]);

  const loadCategories = async () => {
    try {
      const response = await axios.get(`${API}/categories`);
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      setError('⚠️ Грешка при зареждане на категориите.');
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (searchTerm) params.append('search', searchTerm);

      const response = await axios.get(`${API}/products?${params.toString()}`);
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      setError('⚠️ Грешка при зареждане на продуктите.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    alert('✅ Продуктът е добавен в количката!');
  };

  const calculateDiscountedPrice = (price, discount) =>
    (price * (1 - discount / 100)).toFixed(2);

  const openModal = (product) => setSelectedProduct(product);
  const closeModal = () => setSelectedProduct(null);

  return (
    <div className="container">
      <h1 style={{ color: '#00b2ff', marginBottom: '30px', textAlign: 'center', fontSize: '36px' }}>
        🎯 Нашите Продукти
      </h1>

      {/* Филтри */}
      <div
        style={{
          display: 'flex',
          gap: '15px',
          marginBottom: '30px',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        <input
          type="text"
          placeholder="🔍 Търсене..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '10px 15px',
            borderRadius: '5px',
            border: '2px solid #00b2ff',
            backgroundColor: '#111',
            color: '#fff',
            minWidth: '250px',
          }}
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            padding: '10px 15px',
            borderRadius: '5px',
            border: '2px solid #00b2ff',
            backgroundColor: '#111',
            color: '#fff',
            minWidth: '200px',
          }}
        >
          <option value="">Всички категории</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {(selectedCategory || searchTerm) && (
          <button
            onClick={() => {
              setSelectedCategory('');
              setSearchTerm('');
            }}
            className="btn btn-secondary"
          >
            ✕ Изчисти филтри
          </button>
        )}
      </div>

      {/* Продукти */}
      {loading ? (
        <div className="loading">⏳ Зареждане...</div>
      ) : error ? (
        <div style={{ textAlign: 'center', color: 'red' }}>{error}</div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', color: '#888' }}>
          😟 Няма намерени продукти
        </div>
      ) : (
        <div className="grid grid-4">
          {products.map((product) => (
            <div key={product.id} className="product-card" style={{ position: 'relative' }}>
              {product.discount_percentage > 0 && (
                <div className="discount-badge">-{product.discount_percentage}%</div>
              )}
              <img
                src={product.image_url}
                alt={product.name}
                onClick={() => openModal(product)}
              />
              <div className="product-info">
                <div className="product-name">{product.name}</div>
                <div className="product-price">
                  {product.discount_percentage > 0 && (
                    <span className="product-old-price">{product.price.toFixed(2)}лв.</span>
                  )}
                  {calculateDiscountedPrice(product.price, product.discount_percentage)}лв.
                </div>
                <button
                  onClick={() => handleAddToCart(product)}
                  className="btn btn-secondary"
                  style={{ width: '100%', marginTop: '10px' }}
                  disabled={product.stock === 0}
                >
                  {product.stock === 0 ? 'Няма наличност' : '🛒 Добави'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Модал */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              &times;
            </button>
            <h2 style={{ color: '#00b2ff', marginBottom: '20px' }}>
              {selectedProduct.name}
            </h2>
            <img
              src={selectedProduct.image_url}
              alt={selectedProduct.name}
              style={{
                width: '100%',
                maxWidth: '400px',
                display: 'block',
                margin: '0 auto 20px',
              }}
            />
            <p style={{ color: '#ccc', marginBottom: '15px', lineHeight: '1.6' }}>
              {selectedProduct.description}
            </p>
            <div style={{ marginBottom: '15px' }}>
              <strong style={{ color: '#ff9900' }}>Категория:</strong>{' '}
              {selectedProduct.category}
            </div>
            <div style={{ marginBottom: '15px' }}>
              <strong style={{ color: '#ff9900' }}>Наличност:</strong>{' '}
              {selectedProduct.stock} бр.
            </div>
            <div
              className="product-price"
              style={{ fontSize: '24px', marginBottom: '20px' }}
            >
              {selectedProduct.discount_percentage > 0 && (
                <span className="product-old-price">
                  {selectedProduct.price.toFixed(2)}лв.
                </span>
              )}
              {calculateDiscountedPrice(
                selectedProduct.price,
                selectedProduct.discount_percentage
              )}
              лв. /{' '}
              {calculateDiscountedPrice(
                selectedProduct.price_eur,
                selectedProduct.discount_percentage
              )}
              €
            </div>
            <button
              onClick={() => {
                handleAddToCart(selectedProduct);
                closeModal();
              }}
              className="btn btn-primary"
              style={{ width: '100%', padding: '15px' }}
              disabled={selectedProduct.stock === 0}
            >
              {selectedProduct.stock === 0
                ? 'Няма наличност'
                : '🛒 Добави в количката'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
