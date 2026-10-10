import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TrendingUp } from "lucide-react";
import "./Progress.css";

function Progress() {
  const navigate = useNavigate();
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
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load progress");
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

  const completedSessions = sessions.filter(
    (session) => session.status === "Completed",
  ).length;

  const totalSessions = sessions.length;

  const completionPercentage =
    totalSessions > 0
      ? Math.round((completedSessions / totalSessions) * 100)
      : 0;

  const evaluatedQuestions = sessions.flatMap((session) =>
    session.questions.filter(
      (question) =>
        question.userAnswer?.trim() &&
        question.feedback?.trim() &&
        typeof question.score === "number",
    ),
  );

  const averageScore =
    evaluatedQuestions.length > 0
      ? (
          evaluatedQuestions.reduce(
            (total, question) => total + question.score,
            0,
          ) / evaluatedQuestions.length
        ).toFixed(1)
      : "--";

  if (loading) {
    return (
      <main className="progress-page">
        <p>Loading your progress...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="progress-page">
        <p className="progress-error">{error}</p>
        <Link to="/dashboard" className="dashboard-back-link">
          Dashboard
        </Link>
      </main>
    );
  }

  return (
    <main className="progress-page">
      <header className="progress-header">
        <div className="progress-icon">
          <TrendingUp size={25} />
        </div>

        <div>
          <p>YOUR PERFORMANCE</p>
          <h1>Progress</h1>
          <span>Track your interview practice and performance.</span>
        </div>
      </header>

      <section className="progress-stats">
        <article className="progress-stat-card">
          <span>Total interviews</span>
          <strong>{totalSessions}</strong>
        </article>

        <article className="progress-stat-card">
          <span>Completed interviews</span>
          <strong>{completedSessions}</strong>
        </article>

        <article className="progress-stat-card">
          <span>Average score</span>
          <strong>
            {averageScore}
            {averageScore !== "--" && "/10"}
          </strong>
        </article>
      </section>

      <section className="progress-detail-card">
        <div className="progress-detail-heading">
          <h2>Interview completion</h2>
          <strong>{completionPercentage}%</strong>
        </div>

        <div
          className="completion-progress-track"
          role="progressbar"
          aria-label="Interview completion"
          aria-valuenow={completionPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="completion-progress-fill"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        <p>
          {completedSessions} of {totalSessions} interviews completed
        </p>
      </section>

      <section className="progress-detail-card">
        <h2>Evaluated questions</h2>
        <strong className="evaluated-question-count">
          {evaluatedQuestions.length}
        </strong>
        <p>Questions with saved answers, feedback, and scores.</p>
      </section>
    </main>
  );
}

export default Progress;
