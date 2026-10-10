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

  const completedSessions = sessions.filter(
    (session) => session.status === "Completed",
  ).length;

  const inProgressSessions = sessions.filter(
    (session) => session.status === "In Progress",
  ).length;
  const latestInProgressSession = sessions.find(
    (session) => session.status === "In Progress",
  );

  const evaluatedAnswers = sessions.flatMap((session) =>
    session.questions
      .filter(
        (question) =>
          question.userAnswer?.trim() &&
          question.feedback?.trim() &&
          typeof question.score === "number" &&
          question.score >= 0 &&
          question.score <= 10,
      )
      .map((question) => ({
        jobRole: session.jobRole,
        topic: session.topic,
        question: question.question,
        answer: question.userAnswer,
        feedback: question.feedback,
        score: question.score,
      })),
  );

  const lowestScoringAnswer = [...evaluatedAnswers].sort(
    (a, b) => a.score - b.score,
  )[0];

  const practiceRecommendation = lowestScoringAnswer
    ? {
        title:
          lowestScoringAnswer.score < 4
            ? "Let's strengthen your fundamentals"
            : lowestScoringAnswer.score < 7
              ? "Build on your current skills"
              : "Polish your interview technique",

        detail: `Your response scored ${lowestScoringAnswer.score}/10. ${lowestScoringAnswer.feedback}`,
        topic: lowestScoringAnswer.topic || lowestScoringAnswer.jobRole,
      }
    : null;

  const dailyQuestionGoal = 5;

  const today = new Date().toDateString();

  const questionsPractisedToday = sessions.reduce(
    (total, session) =>
      total +
      session.questions.filter((question) => {
        if (
          !question.evaluatedAt ||
          !question.userAnswer?.trim() ||
          !question.feedback?.trim() ||
          typeof question.score !== "number"
        ) {
          return false;
        }

        return new Date(question.evaluatedAt).toDateString() === today;
      }).length,
    0,
  );

  const dailyGoalProgress = Math.min(
    Math.round((questionsPractisedToday / dailyQuestionGoal) * 100),
    100,
  );

  const completionPercentage =
    totalSessions > 0
      ? Math.round((completedSessions / totalSessions) * 100)
      : 0;
  const totalQuestions = sessions.reduce(
    (total, session) => total + session.questions.length,
    0,
  );

  const scoredQuestions = sessions.flatMap((session) =>
    session.questions.filter(
      (question) =>
        question.userAnswer?.trim() &&
        question.feedback?.trim() &&
        typeof question.score === "number",
    ),
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
              Your potential, in practice.
              <span className="name-highlight">
                {user?.name?.split(" ")[0] || "there"}
              </span>
              <span className="heading-orbit" aria-hidden="true">
                <span className="orbit-core"></span>
                <span className="orbit-dot"></span>
              </span>
            </h1>

            <p className="dashboard-subtitle">
              Sharpen your skills with focused practice and intelligent
              feedback.
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

        {/* AI Coach Workspace */}
        <section className="ai-engine coach-workspace">
          <div className="ai-grid"></div>

          <div className="ai-engine-content coach-content">
            <div className="ai-status">
              <span className="ai-status-dot"></span>
              YOUR AI INTERVIEW COACH
            </div>

            <p className="ai-label">Make every answer count.</p>

            <h2>
              {latestInProgressSession
                ? "Keep building your confidence."
                : "Build confidence through practice."}
            </h2>

            <p className="ai-description">
              {latestInProgressSession
                ? `Continue your ${latestInProgressSession.jobRole} interview and keep building confidence with every answer.`
                : "Practice role-specific questions, get AI feedback, and build confidence one interview at a time."}
            </p>

            {latestInProgressSession ? (
              <Link
                to={`/interview/${latestInProgressSession._id}`}
                className="ai-start-button"
              >
                Continue interview
              </Link>
            ) : (
              <Link to="/interview/setup" className="ai-start-button">
                Start an interview
              </Link>
            )}
          </div>

          <div className="coach-decoration" aria-hidden="true">
            <div className="coach-decoration-orb"></div>
            <div className="coach-decoration-ring"></div>
            <div className="coach-decoration-core">
              <BrainCircuit size={46} />
            </div>
            <div className="coach-decoration-label">
              <Sparkles size={14} />
              SMART PRACTICE
            </div>
          </div>
        </section>

        {/* Daily Practice Goal */}
        <section className="daily-goal-card">
          <div className="daily-goal-header">
            <div className="daily-goal-icon">
              <Target size={20} />
            </div>

            <div className="daily-goal-heading">
              <p className="dashboard-eyebrow">YOUR DAILY GOAL</p>
              <h2>Small steps, stronger answers.</h2>
            </div>

            <span className="daily-goal-count">
              {Math.min(questionsPractisedToday, dailyQuestionGoal)}/
              {dailyQuestionGoal}
            </span>
          </div>

          <p className="daily-goal-description">
            {questionsPractisedToday >= dailyQuestionGoal
              ? "Daily goal complete. Great work putting your skills into practice!"
              : `Evaluate ${dailyQuestionGoal - questionsPractisedToday} more ${
                  dailyQuestionGoal - questionsPractisedToday === 1
                    ? "answer"
                    : "answers"
                } to reach today's goal.`}
          </p>

          <div
            className="daily-goal-track"
            role="progressbar"
            aria-label="Daily practice goal"
            aria-valuemin={0}
            aria-valuemax={dailyQuestionGoal}
            aria-valuenow={Math.min(questionsPractisedToday, dailyQuestionGoal)}
          >
            <div
              className="daily-goal-fill"
              style={{ width: `${dailyGoalProgress}%` }}
            />
          </div>
        </section>

        {/* Personalized Practice Recommendation */}
        <section className="practice-recommendation">
          <div className="recommendation-icon">
            <Target size={22} />
          </div>

          <div className="recommendation-content">
            <p className="dashboard-eyebrow">PERSONALIZED FOR YOU</p>

            <h2>
              {practiceRecommendation
                ? practiceRecommendation.title
                : "Build your interview foundation"}
            </h2>

            <p>
              {practiceRecommendation
                ? practiceRecommendation.detail
                : "Complete an interview and receive AI feedback to discover which skills you can strengthen."}
            </p>

            {practiceRecommendation?.topic && (
              <span className="recommendation-topic">
                {practiceRecommendation.topic}
              </span>
            )}
          </div>

          {practiceRecommendation && (
            <Link to="/interview/setup" className="recommendation-action">
              Practise again
            </Link>
          )}
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

              <Link to="/interview/setup">Start your first interview</Link>
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
                    to={
                      session.status === "Completed"
                        ? `/results/${session._id}`
                        : `/interview/${session._id}`
                    }
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

                      <span
                        className={`session-status ${
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
      </section>
    </main>
  );
}

export default Dashboard;
