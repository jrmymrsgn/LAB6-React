import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
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
      const found = data.data.find(
        (p) => String(p.id) === String(id)
      );

      if (found) {
        setForm({
          product_name: found.product_name,
          description: found.description || '',
          price: found.price,
          quantity: found.quantity,
        });
      }
    }).catch((err) => {
      setError(getErrorMessage(err));
    });
  }, [id, isEdit]);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
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
    <div className="form-page">
      <div className="form-card">

        <div className="brand">
          lab6db / products
        </div>

        <h1>
          {isEdit ? 'Edit Product' : 'Add Product'}
        </h1>

        <div className="sub">
          {isEdit
            ? 'Update the product details'
            : 'Fill in the product details'}
        </div>

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <label htmlFor="product_name">
            Product Name
          </label>

          <input
            id="product_name"
            name="product_name"
            value={form.product_name}
            onChange={handleChange}
            required
          />

          <label htmlFor="description">
            Description
          </label>

          <textarea
            id="description"
            name="description"
            rows="3"
            value={form.description}
            onChange={handleChange}
          />

          <label htmlFor="price">
            Price
          </label>

          <input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={handleChange}
            required
          />

          <label htmlFor="quantity">
            Quantity
          </label>

          <input
            id="quantity"
            name="quantity"
            type="number"
            min="0"
            value={form.quantity}
            onChange={handleChange}
            required
          />

          <button
            type="submit"
            className="save-btn"
            disabled={loading}
          >
            {loading
              ? 'Saving...'
              : isEdit
                ? 'Update Product'
                : 'Save Product'}
          </button>

          <Link to="/" className="cancel-link">
           Cancel
          </Link>

        </form>
      </div>
    </div>
  );
}