import "../App.css";
import prepforgeLogo from "../assets/prepforge.jpg";
import { Link } from "react-router-dom";

function Landing() {
  return (
    <main className="app">
      <section className="hero">
        <nav className="navbar">
          <div className="brand">
            <img
              src={prepforgeLogo}
              alt="PrepForge logo"
              className="brand-logo"
            />

            <span>PrepForge</span>
          </div>

          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
            <Link to="/login" className="nav-login">
              Log in
            </Link>
          </div>
        </nav>

        <div className="hero-content">
          <div className="hero-badge">
            <span className="pulse-dot"></span>
            AI-powered interview preparation
          </div>

          <h1>
            Turn interview
            <span> preparation </span>
            into practice.
          </h1>

          <p>
            Personalized questions, realistic practice, and AI-powered feedback
            designed around the role you want.
          </p>

          <div className="hero-actions">
            <Link to="/register" className="primary-button">
              Start practicing
              <span>➜</span>
            </Link>
            <button className="secondary-button">Explore PrepForge</button>
          </div>

          <div className="hero-stats">
            <div>
              <strong>AI</strong>
              <span>Personalized practice</span>
            </div>

            <div>
              <strong>0–10</strong>
              <span>Answer scoring</span>
            </div>

            <div>
              <strong>∞</strong>
              <span>Practice sessions</span>
            </div>
          </div>
        </div>

        <div className="hero-glow glow-one"></div>
        <div className="hero-glow glow-two"></div>
      </section>
    </main>
  );
}

export default Landing;
