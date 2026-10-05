import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const { logout } = useAuth();

  function loadProducts() {
    api
      .get('/products')
      .then(({ data }) => setProducts(data.data))
      .catch((err) => setError(getErrorMessage(err)));
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function handleDelete(id) {
    if (!window.confirm('Delete this product? This cannot be undone.')) return;
    try {
      await api.delete(`/products/${id}`);
      loadProducts();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleLogout() {
    if (!window.confirm('Log out of your account?')) return;
    await logout();
  }

  return (
    <div className="page-wrap">
      <div className="masthead">
        <div className="actions">
          <Link className="add" to="/products/new">
            + Add Product
          </Link>
          <button className="logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="panel">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Price</th>
              <th>Qty</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty">
                  No products yet — add your first one.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id}>
                  <td className="id-cell">#{p.id}</td>
                  <td className="name-cell">{p.product_name}</td>
                  <td className="desc-cell">{p.description}</td>
                  <td className="price-cell">₱{Number(p.price).toFixed(2)}</td>
                  <td>
                    <span className="qty-badge">{p.quantity}</span>
                  </td>
                  <td className="date-cell">{p.created_at}</td>
                  <td className="row-actions">
                    <Link className="edit" to={`/products/${p.id}/edit`}>
                      Edit
                    </Link>
                    <button className="delete" onClick={() => handleDelete(p.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}