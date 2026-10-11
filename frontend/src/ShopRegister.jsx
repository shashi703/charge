
import { useState } from 'react';

function ShopRegister({ onBack }) {
  const [formData, setFormData] = useState({
    shopName: '',
    fullName: '',
    email: '',
    phone: '',
    shopAddress: '',
    password: ''
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage('');
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch(
        'http://localhost:5000/api/shop-owners/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed.');
      }

      setSuccess(true);
      setMessage(data.message);

      setFormData({
        shopName: '',
        fullName: '',
        email: '',
        phone: '',
        shopAddress: '',
        password: ''
      });
    } catch (error) {
      setMessage(
        error.message === 'Failed to fetch'
          ? 'Cannot connect to the backend. Check whether the server is running.'
          : error.message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-box">
        <h1>Register Your Shop</h1>
        <p>Enter your shop details</p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="shopName"
            placeholder="Shop name"
            value={formData.shopName}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="fullName"
            placeholder="Owner name"
            value={formData.fullName}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="tel"
            name="phone"
            placeholder="Phone number"
            value={formData.phone}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="shopAddress"
            placeholder="Shop address"
            value={formData.shopAddress}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Create password (minimum 8 characters)"
            value={formData.password}
            onChange={handleChange}
            minLength={8}
            maxLength={72}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register Shop'}
          </button>
        </form>

        {message && (
          <p
            role="status"
            style={{
              color: success ? 'green' : 'crimson',
              marginTop: '12px'
            }}
          >
            {message}
          </p>
        )}

        {success && (
          <p>
            Your shop is pending review. Approval is not yet automated.
          </p>
        )}

        <button
          className="back-btn"
          type="button"
          onClick={onBack}
        >
          ← Back
        </button>
      </div>
    </div>
  );
}

export default ShopRegister;
