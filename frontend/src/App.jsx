```jsx
import { useEffect, useState } from 'react'
import './App.css'

import Login from './Login'
import Register from './Register'
import ShopRegister from './ShopRegister'
import CustomerRegister from './CustomerRegister'
import RiderRegister from './RiderRegister'
import ShopMap from './ShopMap'

function App() {
  const [page, setPage] = useState('home')
  const [serverMessage, setServerMessage] = useState('')
  const [serverError, setServerError] = useState(false)

  // Check the backend connection
  useEffect(() => {
    fetch('http://localhost:5000/api/test')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Backend request failed')
        }
        return response.json()
      })
      .then((data) => {
        setServerMessage(data.message)
        setServerError(false)
      })
      .catch((error) => {
        console.error('Backend connection error:', error)
        setServerMessage(
          'Backend connection failed. Please check the server.'
        )
        setServerError(true)
      })
  }, [])

  // Login page
  if (page === 'login') {
    return <Login onBack={() => setPage('home')} />
  }

  // Choose account type
  if (page === 'register') {
    return (
      <Register
        onBack={() => setPage('home')}
        onSelectType={setPage}
      />
    )
  }

  // Registration pages
  if (page === 'shop') {
    return <ShopRegister onBack={() => setPage('register')} />
  }

  if (page === 'customer') {
    return <CustomerRegister onBack={() => setPage('register')} />
  }

  if (page === 'rider') {
    return <RiderRegister onBack={() => setPage('register')} />
  }

  // Homepage
  return (
    <div className="app">
      <p
        className="server-status"
        role="status"
        style={{ color: serverError ? '#b91c1c' : '#16803c' }}
      >
        {serverMessage || 'Connecting to backend...'}
      </p>

      <header className="navbar">
        <div className="logo">
          PanShop<span>App</span>
        </div>

        <nav>
          <a href="#home">Home</a>
          <a href="#shops">Shops</a>
          <a href="#about">About</a>
        </nav>

        <div className="auth-buttons">
          <button
            className="login-btn"
            onClick={() => setPage('login')}
          >
            Login
          </button>

          <button
            className="register-btn"
            onClick={() => setPage('register')}
          >
            Register
          </button>
        </div>
      </header>

      <main>
        {/* Homepage banner */}
        <section id="home" className="hero-section">
          <div className="hero-content">
            <p className="tagline">YOUR LOCAL SHOPS, ONE PLACE</p>

            <h1>
              Find what you need,
              <br />
              <span>near you.</span>
            </h1>

            <p className="description">
              Discover nearby registered shops, check available stock,
              reserve items, and place your order easily.
            </p>

            <div className="hero-buttons">
              <button
                className="primary-btn"
                onClick={() =>
                  document.getElementById('shops')?.scrollIntoView({
                    behavior: 'smooth',
                  })
                }
              >
                Find Nearby Shops
              </button>

              <button
                className="secondary-btn"
                onClick={() => setPage('shop')}
              >
                Register Your Shop
              </button>
            </div>
          </div>

          <div className="hero-card">
            <div className="card-icon">🏪</div>
            <h2>Nearby Shops</h2>
            <p>Check availability before you visit.</p>

            <div className="shop-preview">
              <span>🟢</span>
              <div>
                <strong>Local Shop</strong>
                <small>Open • Stock available</small>
              </div>
            </div>

            <div className="shop-preview">
              <span>🟢</span>
              <div>
                <strong>Nearby Store</strong>
                <small>Open • Stock available</small>
              </div>
            </div>
          </div>
        </section>

        {/* Map showing registered shops */}
        <ShopMap />

        {/* How the app works */}
        <section id="shops" className="features">
          <div className="section-heading">
            <p>HOW IT WORKS</p>
            <h2>Simple. Fast. Local.</h2>
          </div>

          <div className="feature-grid">
            <div className="feature-card">
              <div>📍</div>
              <h3>Find Shops</h3>
              <p>Discover registered shops near your location.</p>
            </div>

            <div className="feature-card">
              <div>📦</div>
              <h3>Check Stock</h3>
              <p>See what products are currently available.</p>
            </div>

            <div className="feature-card">
              <div>🛒</div>
              <h3>Order or Reserve</h3>
              <p>
                Add products to your cart or reserve them for pickup.
              </p>
            </div>

            <div className="feature-card">
              <div>🚚</div>
              <h3>Pickup or Delivery</h3>
              <p>
                Choose pickup or available local delivery.
              </p>
            </div>
          </div>
        </section>

        {/* About the app */}
        <section id="about" className="about-section">
          <h2>Built for local shops and customers.</h2>
          <p>
            PanShopApp connects customers with nearby registered shops,
            making local shopping easier and more convenient.
          </p>
        </section>
      </main>

      <footer>
        <p>© 2026 PanShopApp. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default App
```