import { useState } from 'react';
import './Login.css';

function Login({ onBack }) {
  const [role, setRole] = useState('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage('');
    setUser(null);
    setLoading(true);

    const loginRoutes = {
      customer: 'customers',
      shop_owner: 'shop-owners',
      rider: 'riders'
    };

    try {
      const response = await fetch(
        `http://localhost:5000/api/${loginRoutes[role]}/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email,
            password
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Login failed.');
        return;
      }

      setUser(data.user);
      setMessage(data.message || 'Login successful!');
      setPassword('');
    } catch (error) {
      setMessage(
        'Cannot connect to the server. Please check whether the backend is running.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-box">
        <h1>Login</h1>
        <p>Welcome back to Charge</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="account-role">Login as</label>

          <select
            id="account-role"
            value={role}
            onChange={(event) => {
              setRole(event.target.value);
              setMessage('');
              setUser(null);
            }}
            required
          >
            <option value="customer">Customer</option>
            <option value="shop_owner">Shop Owner</option>
            <option value="rider">Rider</option>
          </select>

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {message && <p role="status">{message}</p>}

        {user && (
          <div>
            <h2>Welcome, {user.fullName}!</h2>
            <p>Email: {user.email}</p>
            <p>Role: {user.role}</p>

            {user.shopName && (
              <>
                <p>Shop Name: {user.shopName}</p>
                <p>Shop Address: {user.shopAddress}</p>
                <p>
                  Shop Status:{' '}
                  {user.shopStatus === 'pending_review'
                    ? 'Pending Review'
                    : user.shopStatus}
                </p>
              </>
            )}

            {user.bikeRegistration && (
              <>
                <p>Bike Registration: {user.bikeRegistration}</p>
                <p>Service Area: {user.serviceArea}</p>
              </>
            )}
          </div>
        )}

        <button
          className="back-btn"
          type="button"
          onClick={onBack}
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}

export default Login;