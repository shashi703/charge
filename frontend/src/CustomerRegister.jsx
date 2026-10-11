import { useState } from 'react';

function CustomerRegister({ onBack }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: ''
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage('');
    setLoading(true);

    try {
      const response = await fetch(
        'http://localhost:5000/api/customers/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        }
      );

      const data = await response.json();

      setMessage(data.message);

      if (response.ok) {
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          password: ''
        });
      }
    } catch (error) {
      setMessage(
        'Cannot connect to the server. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-box">
        <h1>Customer Registration</h1>
        <p>Create your customer account</p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="fullName"
            placeholder="Full name"
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
            type="password"
            name="password"
            placeholder="Create password (8 characters minimum)"
            value={formData.password}
            onChange={handleChange}
            minLength={8}
            maxLength={72}
            required
          />

          <button type="submit" disabled={loading}>
            {loading
              ? 'Creating Account...'
              : 'Create Customer Account'}
          </button>
        </form>

        {message && <p>{message}</p>}

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

export default CustomerRegister;