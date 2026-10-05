import { useEffect, useState } from "react";
import {
  BrainCircuit,
  Code2,
  Database,
  Gauge,
  LayoutDashboard,
  LogOut,
  Play,
  Settings,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import "./Dashboard.css";
import prepforgeLogo from "../assets/prepforge.jpg";

function Dashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch("http://localhost:5000/api/interviews", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load sessions");
        }

        setSessions(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [navigate]);

  const totalSessions = sessions.length;

  const totalQuestions = sessions.reduce(
    (total, session) => total + session.questions.length,
    0,
  );

  const scoredQuestions = sessions.flatMap((session) =>
    session.questions.filter((question) => typeof question.score === "number"),
  );

  const averageScore =
    scoredQuestions.length > 0
      ? (
          scoredQuestions.reduce(
            (total, question) => total + question.score,
            0,
          ) / scoredQuestions.length
        ).toFixed(1)
      : "--";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <main className="dashboard">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <Link to="/" className="dashboard-brand">
          <img
            src={prepforgeLogo}
            alt="PrepForge"
            className="dashboard-brand-logo"
          />
          <span>PrepForge</span>
        </Link>

        <nav className="dashboard-nav">
          <p className="nav-label">Workspace</p>

          <Link to="/dashboard" className="dashboard-nav-item active">
            <LayoutDashboard size={18} />
            Dashboard
          </Link>

          <Link to="/interview/setup" className="dashboard-nav-item">
            <Play size={18} />
            Practice
          </Link>

          <Link to="/dashboard" className="dashboard-nav-item">
            <TrendingUp size={18} />
            Progress
          </Link>

          <Link to="/dashboard" className="dashboard-nav-item">
            <Gauge size={18} />
            Sessions
          </Link>

          <p className="nav-label nav-label-bottom">Account</p>

          <Link to="/dashboard" className="dashboard-nav-item">
            <Settings size={18} />
            Settings
          </Link>
        </nav>

        <button className="logout-button" onClick={handleLogout}>
          <LogOut size={18} />
          Log out
        </button>
      </aside>

      {/* Main */}
      <section className="dashboard-main">
        <header className="dashboard-header">
          <div className="dashboard-heading">
            <div className="heading-kicker">
              <span className="kicker-line"></span>
              <Sparkles size={14} />
              INTERVIEW WORKSPACE
            </div>

            <h1>
              Ready to level up,
              <span className="name-highlight">
                {user?.name?.split(" ")[0] || "there"}
              </span>
              <span className="heading-orbit" aria-hidden="true">
                <span className="orbit-core"></span>
                <span className="orbit-dot"></span>
              </span>
            </h1>

            <p className="dashboard-subtitle">
              Your next great interview starts with one smart practice session.
            </p>
          </div>

          <div className="dashboard-profile">
            <div className="profile-avatar">
              <UserRound size={18} />
            </div>

            <div>
              <strong>{user?.name || "User"}</strong>
              <span>{user?.targetRole || "Interview Candidate"}</span>
            </div>
          </div>
        </header>

        {/* AI Interview Engine */}
        <section className="ai-engine">
          <div className="ai-grid"></div>

          <div className="floating-icon icon-code">
            <Code2 size={22} />
          </div>

          <div className="floating-icon icon-database">
            <Database size={22} />
          </div>

          <div className="floating-icon icon-target">
            <Target size={22} />
          </div>

          <div className="floating-icon icon-trending">
            <TrendingUp size={22} />
          </div>

          <div className="ai-engine-content">
            <div className="ai-status">
              <span className="ai-status-dot"></span>
              AI ENGINE ONLINE
            </div>

            <div className="ai-icon">
              <BrainCircuit size={34} />
            </div>

            <p className="ai-label">YOUR NEXT INTERVIEW</p>

            <h2>Ready to practice?</h2>

            <p className="ai-description">
              Generate a personalized interview based on your target role,
              experience, topic, and difficulty.
            </p>

            <Link to="/interview/setup" className="ai-start-button">
              Start an interview
              <span>➜</span>
            </Link>
          </div>

          <div className="ai-pulse pulse-one"></div>
          <div className="ai-pulse pulse-two"></div>
        </section>

        {/* Stats */}
        <section className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon">
              <Play size={18} />
            </div>

            <div>
              <span>Sessions</span>
              <strong>{totalSessions}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Target size={18} />
            </div>

            <div>
              <span>Average score</span>
              <strong>{averageScore}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Code2 size={18} />
            </div>

            <div>
              <span>Questions</span>
              <strong>{totalQuestions}</strong>
            </div>
          </div>
        </section>

        {/* Recent Sessions */}
        <section className="recent-section">
          <div className="section-heading">
            <div>
              <p className="dashboard-eyebrow">YOUR ACTIVITY</p>
              <h2>Recent interviews</h2>
            </div>

            <Link to="/interview/setup" className="section-action">
              New session
              <span>➜</span>
            </Link>
          </div>

          {loading ? (
            <div className="sessions-loading">
              <div className="loading-orbit"></div>
              <p>Loading your interviews...</p>
            </div>
          ) : error ? (
            <div className="sessions-error">
              <p>{error}</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="empty-sessions">
              <div className="empty-icon">
                <BrainCircuit size={24} />
              </div>

              <h3>No interviews yet</h3>

              <p>Your completed interview sessions will appear here.</p>

              <Link to="/interview/setup">
                Start your first interview <span>➜</span>
              </Link>
            </div>
          ) : (
            <div className="session-list">
              {sessions.slice(0, 5).map((session) => {
                const answeredQuestions = session.questions.filter(
                  (question) =>
                    question.userAnswer &&
                    question.userAnswer.trim() &&
                    typeof question.score === "number",
                );

                const sessionScore =
                  answeredQuestions.length > 0
                    ? (
                        answeredQuestions.reduce(
                          (total, question) => total + question.score,
                          0,
                        ) / answeredQuestions.length
                      ).toFixed(1)
                    : "--";

                return (
                  <Link
                    to={`/interview/${session._id}`}
                    className="session-card"
                    key={session._id}
                  >
                    <div className="session-main">
                      <div className="session-icon">
                        <Code2 size={19} />
                      </div>

                      <div className="session-info">
                        <h3>{session.jobRole}</h3>

                        <p>
                          {session.topic || "General interview"} <span>•</span>{" "}
                          {session.difficulty} <span>•</span>{" "}
                          {session.questions.length} questions
                        </p>
                      </div>
                    </div>

                    <div className="session-result">
                      <strong>
                        {sessionScore}
                        {sessionScore !== "--" && <small>/10</small>}
                      </strong>

                      <span>Score</span>
                    </div>

                    <div className="session-arrow">→</div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export default Dashboard;
