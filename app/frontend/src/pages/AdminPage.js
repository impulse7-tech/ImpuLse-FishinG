Now let's create the Admin page:
Action: file_editor create /app/frontend/src/pages/AdminPage.js --file-text "import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  const API = `${BACKEND_URL}/api`;

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    loadData();
  }, [isAdmin, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      if (activeTab === 'products') {
        const response = await axios.get(`${API}/products`, { headers });
        setProducts(response.data);
      } else {
        const response = await axios.get(`${API}/orders`, { headers });
        setOrders(response.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Сигурни ли сте, че искате да изтриете този продукт?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('✅ Продуктът е изтрит');
      loadData();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('❌ Грешка при изтриване');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API}/orders/${orderId}/status?status=${newStatus}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('✅ Статусът е променен');
      loadData();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('❌ Грешка при промяна на статус');
    }
  };

  const ProductForm = ({ product, onClose }) => {
    const [formData, setFormData] = useState(
      product || {
        name: '',
        description: '',
        price: 0,
        price_eur: 0,
        category: '',
        image_url: '',
        stock: 0,
        discount_percentage: 0
      }
    );

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        if (product) {
          await axios.put(`${API}/products/${product.id}`, formData, { headers });
          alert('✅ Продуктът е обновен');
        } else {
          await axios.post(`${API}/products`, formData, { headers });
          alert('✅ Продуктът е създаден');
        }
        onClose();
        loadData();
      } catch (error) {
        console.error('Error saving product:', error);
        alert('❌ Грешка при запазване');
      }
    };

    return (
      <div className=\"modal-overlay\" onClick={onClose}>
        <div className=\"modal-content\" onClick={(e) => e.stopPropagation()}>
          <button className=\"modal-close\" onClick={onClose}>&times;</button>
          <h2 style={{ color: '#00b2ff', marginBottom: '20px' }}>
            {product ? 'Редактиране на продукт' : 'Нов продукт'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className=\"form-group\">
              <label>Име</label>
              <input
                type=\"text\"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className=\"form-group\">
              <label>Описание</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows=\"3\"
              />
            </div>
            <div className=\"grid grid-2\">
              <div className=\"form-group\">
                <label>Цена (лв)</label>
                <input
                  type=\"number\"
                  step=\"0.01\"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div className=\"form-group\">
                <label>Цена (€)</label>
                <input
                  type=\"number\"
                  step=\"0.01\"
                  value={formData.price_eur}
                  onChange={(e) => setFormData({ ...formData, price_eur: parseFloat(e.target.value) })}
                  required
                />
              </div>
            </div>
            <div className=\"form-group\">
              <label>Категория</label>
              <input
                type=\"text\"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              />
            </div>
            <div className=\"form-group\">
              <label>URL на изображение</label>
              <input
                type=\"url\"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              />
            </div>
            <div className=\"grid grid-2\">
              <div className=\"form-group\">
                <label>Наличност</label>
                <input
                  type=\"number\"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div className=\"form-group\">
                <label>Отстъпка (%)</label>
                <input
                  type=\"number\"
                  min=\"0\"
                  max=\"100\"
                  value={formData.discount_percentage}
                  onChange={(e) => setFormData({ ...formData, discount_percentage: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <button type=\"submit\" className=\"btn btn-primary\" style={{ width: '100%' }}>
              💾 Запази
            </button>
          </form>
        </div>
      </div>
    );
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

  return (
    <div className=\"container\">
      <h1 style={{ color: '#00b2ff', marginBottom: '30px', fontSize: '36px' }}>
        🔧 Администраторски панел
      </h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
        <button
          onClick={() => setActiveTab('products')}
          className={activeTab === 'products' ? 'btn btn-primary' : 'btn btn-secondary'}
          style={{ padding: '10px 20px' }}
        >
          📦 Продукти
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={activeTab === 'orders' ? 'btn btn-primary' : 'btn btn-secondary'}
          style={{ padding: '10px 20px' }}
        >
          🛒 Поръчки
        </button>
      </div>

      {loading ? (
        <div className=\"loading\">Зареждане...</div>
      ) : activeTab === 'products' ? (
        <>
          <button
            onClick={() => {
              setEditingProduct(null);
              setShowProductForm(true);
            }}
            className=\"btn btn-primary\"
            style={{ marginBottom: '20px' }}
          >
            ➕ Добави нов продукт
          </button>

          <div className=\"grid grid-3\">
            {products.map((product) => (
              <div key={product.id} className=\"product-card\" style={{ position: 'relative' }}>
                {product.discount_percentage > 0 && (
                  <div className=\"discount-badge\">-{product.discount_percentage}%</div>
                )}
                <img src={product.image_url} alt={product.name} />
                <div className=\"product-info\">
                  <div className=\"product-name\">{product.name}</div>
                  <div className=\"product-price\">{product.price.toFixed(2)}лв.</div>
                  <div style={{ color: '#888', fontSize: '14px', marginTop: '5px' }}>
                    Наличност: {product.stock} бр.
                  </div>
                  <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
                    <button
                      onClick={() => {
                        setEditingProduct(product);
                        setShowProductForm(true);
                      }}
                      className=\"btn btn-secondary\"
                      style={{ flex: 1, padding: '8px' }}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className=\"btn btn-danger\"
                      style={{ flex: 1, padding: '8px' }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', flexWrap: 'wrap' }}>
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
                <select
                  value={order.status}
                  onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                  style={{
                    padding: '8px 15px',
                    backgroundColor: getStatusColor(order.status),
                    color: '#000',
                    border: 'none',
                    borderRadius: '5px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  <option value=\"pending\">Изчакваща</option>
                  <option value=\"confirmed\">Потвърдена</option>
                  <option value=\"shipped\">Изпратена</option>
                  <option value=\"delivered\">Доставена</option>
                  <option value=\"cancelled\">Отказана</option>
                </select>
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
                <div style={{ color: '#00b2ff', marginBottom: '10px', fontWeight: 'bold' }}>Продукти:</div>
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

      {showProductForm && (
        <ProductForm
          product={editingProduct}
          onClose={() => {
            setShowProductForm(false);
            setEditingProduct(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminPage;
"
Observation: Create successful: /app/frontend/src/pages/AdminPage.js