import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { getErrorMessage } from '../api/client';

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    product_name: '',
    description: '',
    price: '',
    quantity: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    api.get('/products').then(({ data }) => {
      const found = data.data.find((p) => String(p.id) === String(id));
      if (found) {
        setForm({
          product_name: found.product_name,
          description: found.description || '',
          price: found.price,
          quantity: found.quantity,
        });
      }
    });
  }, [id, isEdit]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/products/${id}`, form);
      } else {
        await api.post('/products', form);
      }
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-wrap">
      <a className="back" href="/">
        &larr; back to products
      </a>
      <h1>{isEdit ? 'Edit Product' : 'Add Product'}</h1>
      <div className="card">
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label>Product name</label>
          <input name="product_name" value={form.product_name} onChange={handleChange} required />

          <label>Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} />

          <label>Price</label>
          <input
            type="number"
            step="0.01"
            name="price"
            value={form.price}
            onChange={handleChange}
            required
          />

          <label>Quantity</label>
          <input
            type="number"
            name="quantity"
            value={form.quantity}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Save Product'}
          </button>
        </form>
      </div>
    </div>
  );
}