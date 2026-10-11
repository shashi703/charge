
function Register({ onBack, onSelectType }) {
  return (
    <div className="login-page">
      <div className="login-box">
        <h1>Create Account</h1>
        <p>Choose your account type</p>

        <div className="account-options">
          <button
            className="account-btn"
            onClick={() => onSelectType('customer')}
          >
            👤
            <strong>Customer</strong>
            <small>Find shops and place orders</small>
          </button>

          <button
            className="account-btn"
            onClick={() => onSelectType('shop')}
          >
            🏪
            <strong>Shop</strong>
            <small>Register and manage your shop</small>
          </button>

          <button
            className="account-btn"
            onClick={() => onSelectType('rider')}
          >
            🏍️
            <strong>Rider</strong>
            <small>Sell stock and deliver orders</small>
          </button>
        </div>

        <button
          className="back-btn"
          onClick={onBack}
          type="button"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  )
}

export default Register