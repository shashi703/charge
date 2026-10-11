
function RiderRegister({ onBack }) {
  return (
    <div className="login-page">
      <div className="login-box">
        <h1>Rider Registration</h1>
        <p>Register to sell your stock and deliver orders</p>

        <form>
          <input
            type="text"
            placeholder="Full name"
            required
          />

          <input
            type="email"
            placeholder="Email address"
            required
          />

          <input
            type="tel"
            placeholder="Phone number"
            required
          />

          <input
            type="text"
            placeholder="Bike registration number"
            required
          />

          <input
            type="text"
            placeholder="Service area / city"
            required
          />

          <input
            type="password"
            placeholder="Create password"
            required
          />

          <button type="submit">
            Register as Rider
          </button>
        </form>

        <button
          className="back-btn"
          onClick={onBack}
          type="button"
        >
          ← Back
        </button>
      </div>
    </div>
  )
}

export default RiderRegister