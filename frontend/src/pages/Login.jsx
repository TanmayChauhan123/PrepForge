import { Link } from "react-router-dom";
import prepforgeLogo from "../assets/prepforge.jpg";
import "./Login.css";

function Login() {
  return (
    <main className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-brand">
          <img src={prepforgeLogo} alt="PrepForge logo" />
          <span>PrepForge</span>
        </Link>

        <div className="auth-header">
          <h1>Welcome back</h1>
          <p>Continue your interview preparation journey.</p>
        </div>

        <form className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" placeholder="you@example.com" />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className="primary-button auth-submit">
            Log in
            <span>➜</span>
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>

      <Link to="/" className="auth-back">
        ← Back to PrepForge
      </Link>
    </main>
  );
}

export default Login;
