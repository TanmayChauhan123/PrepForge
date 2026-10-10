import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Code2 } from "lucide-react";
import "./Sessions.css";

function Sessions() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [filter, setFilter] = useState("All");
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
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load sessions");
        }

        setSessions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [navigate]);

  const filteredSessions =
    filter === "All"
      ? sessions
      : sessions.filter((session) => session.status === filter);

  return (
    <main className="sessions-page">
      <header className="sessions-header">
        <p>YOUR PRACTICE HISTORY</p>
        <h1>Interview Sessions</h1>
        <span>Review your interviews and continue unfinished practice.</span>
      </header>

      <section className="sessions-summary">
        <div>
          <span>Total sessions</span>
          <strong>{sessions.length}</strong>
        </div>
        <div>
          <span>Completed</span>
          <strong>
            {
              sessions.filter((session) => session.status === "Completed")
                .length
            }
          </strong>
        </div>
        <div>
          <span>In progress</span>
          <strong>
            {
              sessions.filter((session) => session.status === "In Progress")
                .length
            }
          </strong>
        </div>
      </section>

      <section className="sessions-content">
        <div className="sessions-toolbar">
          <h2>Your interviews</h2>

          <div className="sessions-filters">
            {["All", "Completed", "In Progress"].map((status) => (
              <button
                key={status}
                type="button"
                className={filter === status ? "active" : ""}
                onClick={() => setFilter(status)}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="sessions-message">Loading your sessions...</p>
        ) : error ? (
          <p className="sessions-message sessions-error">{error}</p>
        ) : filteredSessions.length === 0 ? (
          <div className="sessions-empty">
            <h3>No sessions found</h3>
            <p>
              {filter === "All"
                ? "Start an interview to see your practice history here."
                : `You have no ${filter.toLowerCase()} sessions.`}
            </p>
            <Link to="/interview/setup">Start an interview</Link>
          </div>
        ) : (
          <div className="sessions-list">
            {filteredSessions.map((session) => {
              const evaluatedQuestions = session.questions.filter(
                (question) =>
                  question.userAnswer?.trim() &&
                  question.feedback?.trim() &&
                  typeof question.score === "number",
              );

              const score =
                evaluatedQuestions.length > 0
                  ? (
                      evaluatedQuestions.reduce(
                        (total, question) => total + question.score,
                        0,
                      ) / evaluatedQuestions.length
                    ).toFixed(1)
                  : "--";

              return (
                <Link
                  key={session._id}
                  to={
                    session.status === "Completed"
                      ? `/results/${session._id}`
                      : `/interview/${session._id}`
                  }
                  className="sessions-card"
                >
                  <div className="sessions-card-icon">
                    <Code2 size={19} />
                  </div>

                  <div className="sessions-card-info">
                    <h3>{session.jobRole}</h3>
                    <p>
                      {session.topic || "General interview"} ·{" "}
                      {session.difficulty} · {session.questions.length}{" "}
                      questions
                    </p>
                  </div>

                  <div className="sessions-card-result">
                    <strong>
                      {score}
                      {score !== "--" && <small>/10</small>}
                    </strong>
                    <span
                      className={`sessions-status ${
                        session.status === "Completed"
                          ? "completed"
                          : "in-progress"
                      }`}
                    >
                      {session.status || "In Progress"}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

export default Sessions;
