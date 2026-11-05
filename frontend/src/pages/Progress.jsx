import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TrendingUp, Target } from "lucide-react";
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

  const performanceTrend = sessions
    .filter(
      (session) =>
        session.status === "Completed" &&
        session.questions.some(
          (question) =>
            question.userAnswer?.trim() &&
            question.feedback?.trim() &&
            typeof question.score === "number",
        ),
    )
    .map((session) => {
      const scores = session.questions
        .filter(
          (question) =>
            question.userAnswer?.trim() &&
            question.feedback?.trim() &&
            typeof question.score === "number",
        )
        .map((question) => question.score);

      const average =
        scores.reduce((total, score) => total + score, 0) / scores.length;

      return {
        id: session._id,
        jobRole: session.jobRole,
        date: session.createdAt,
        average: Number(average.toFixed(1)),
      };
    })
    .reverse();
  const topicPerformance = sessions.reduce((topics, session) => {
    session.questions.forEach((question) => {
      if (
        !question.userAnswer?.trim() ||
        !question.feedback?.trim() ||
        typeof question.score !== "number" ||
        question.score < 0 ||
        question.score > 10
      ) {
        return;
      }

      const topic = session.topic?.trim() || "General";

      if (!topics[topic]) {
        topics[topic] = {
          totalScore: 0,
          count: 0,
        };
      }

      topics[topic].totalScore += question.score;
      topics[topic].count += 1;
    });

    return topics;
  }, {});

  const topicPerformanceList = Object.entries(topicPerformance)
    .map(([topic, data]) => ({
      topic,
      average: Number((data.totalScore / data.count).toFixed(1)),
      count: data.count,
    }))
    .sort((a, b) => b.average - a.average);

  const strongTopics = topicPerformanceList.filter((item) => item.average >= 8);
  const weakTopics = topicPerformanceList.filter((item) => item.average < 6);
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

      {/* Performance Overview */}
      <section className="progress-stats">
        <article className="progress-stat-card">
          <span>Total Interviews</span>
          <strong>{totalSessions}</strong>
          <small>Sessions created</small>
        </article>

        <article className="progress-stat-card">
          <span>Completed Interviews</span>
          <strong>{completedSessions}</strong>
          <small>Successfully completed</small>
        </article>

        <article className="progress-stat-card">
          <span>Average Score</span>
          <strong>
            {averageScore}
            {averageScore !== "--" && "/10"}
          </strong>
          <small>Across evaluated answers</small>
        </article>

        <article className="progress-stat-card">
          <span>Evaluated Questions</span>
          <strong>{evaluatedQuestions.length}</strong>
          <small>Answers with saved feedback</small>
        </article>
      </section>

      {/* Interview Completion */}
      <section className="progress-detail-card compact-completion">
        <div className="progress-detail-heading">
          <div>
            <h2>Interview Completion</h2>
            <p>
              {completedSessions} of {totalSessions} interviews completed
            </p>
          </div>

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
      </section>

      {/* Performance Trend */}
      <section className="progress-detail-card performance-analytics">
        <div className="analytics-section-heading">
          <div>
            <span className="analytics-eyebrow">PERFORMANCE ANALYTICS</span>
            <h2>Score Progression</h2>
            <p>See how your interview scores change over time.</p>
          </div>

          <div className="analytics-score-badge">
            <TrendingUp size={16} />
            <span>{averageScore === "--" ? "--" : `${averageScore}/10`}</span>
          </div>
        </div>

        {performanceTrend.length > 0 ? (
          <div className="analytics-chart">
            <div className="analytics-y-axis">
              <span>10</span>
              <span>7.5</span>
              <span>5</span>
              <span>2.5</span>
              <span>0</span>
            </div>

            <div className="analytics-chart-content">
              <div className="analytics-grid">
                {[0, 1, 2, 3, 4].map((line) => (
                  <div key={line} />
                ))}
              </div>

              <svg
                viewBox="0 0 600 220"
                preserveAspectRatio="none"
                className="analytics-svg"
              >
                <defs>
                  <linearGradient
                    id="progressChartGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#8b7cff" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#8b7cff" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {(() => {
                  const chartData = performanceTrend.slice(-10);

                  const points = chartData.map((item, index) => ({
                    x:
                      chartData.length === 1
                        ? 300
                        : 20 + (index * 560) / (chartData.length - 1),
                    y: 200 - item.average * 20,
                  }));

                  const linePoints = points
                    .map((point) => `${point.x},${point.y}`)
                    .join(" ");

                  const areaPoints = `20,200 ${linePoints} ${points[points.length - 1].x},200`;

                  return (
                    <>
                      <polygon
                        points={areaPoints}
                        fill="url(#progressChartGradient)"
                      />

                      <polyline
                        points={linePoints}
                        fill="none"
                        stroke="#9b8cff"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {points.map((point, index) => (
                        <g key={chartData[index].id}>
                          <title>
                            {`${chartData[index].jobRole || "Interview"} — ${chartData[index].average}/10`}
                          </title>

                          <circle
                            cx={point.x}
                            cy={point.y}
                            r="5"
                            fill="#b4a8ff"
                            stroke="#171525"
                            strokeWidth="3"
                          />
                        </g>
                      ))}
                    </>
                  );
                })()}
              </svg>

              <div className="analytics-x-axis">
                {performanceTrend.slice(-10).map((item, index) => (
                  <span key={item.id} title={item.jobRole || "Interview"}>
                    {item.date
                      ? new Date(item.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })
                      : `Session ${index + 1}`}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="analytics-empty">
            <TrendingUp size={28} />
            <h3>Your score progression will appear here</h3>
            <p>
              Complete and evaluate an interview to start tracking your
              performance over time.
            </p>
          </div>
        )}

        <div className="analytics-chart-footer">
          <span>Average score per completed interview</span>
          <strong>Scale: 0–10</strong>
        </div>
      </section>

      {/* Topic-wise Performance */}
      <section className="progress-detail-card topic-performance">
        <div className="analytics-section-heading">
          <div>
            <span className="analytics-eyebrow">SKILL ANALYSIS</span>
            <h2>Topic-wise Performance</h2>
            <p>Discover your strongest areas and topics that need practice.</p>
          </div>
        </div>

        {topicPerformanceList.length > 0 ? (
          <div className="topic-performance-list">
            {topicPerformanceList.map((item) => (
              <div className="topic-performance-item" key={item.topic}>
                <div className="topic-performance-info">
                  <div>
                    <h3>{item.topic}</h3>
                    <span>{item.count} evaluated answers</span>
                  </div>

                  <strong>{item.average}/10</strong>
                </div>

                <div
                  className="topic-progress-track"
                  role="progressbar"
                  aria-label={`${item.topic} average score`}
                  aria-valuemin={0}
                  aria-valuemax={10}
                  aria-valuenow={item.average}
                >
                  <div
                    className="topic-progress-fill"
                    style={{ width: `${item.average * 10}%` }}
                  />
                </div>

                <span className="topic-performance-label">
                  {item.average >= 8
                    ? "Strong performance"
                    : item.average >= 6
                      ? "Good progress"
                      : "Needs more practice"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="analytics-empty">
            <Target size={28} />
            <h3>No topic data available yet</h3>
            <p>
              Complete and evaluate interview answers to see your topic-wise
              performance.
            </p>
          </div>
        )}
      </section>

      {/* Strengths & Areas to Improve */}
      <section className="strengths-section">
        <div className="analytics-section-heading">
          <div>
            <h2>Performance Insights</h2>
            <p>Your strongest and weakest areas based on evaluated answers.</p>
          </div>
        </div>

        <div className="strengths-grid">
          <article className="strength-card">
            <span className="strength-label">Strongest Topic</span>

            {strongTopics.length > 0 ? (
              <>
                <h3>{strongTopics[0].topic}</h3>
                <strong>{strongTopics[0].average}/10</strong>
                <p>You're performing well in this topic.</p>
              </>
            ) : (
              <p className="insight-empty">Not enough evaluated answers yet.</p>
            )}
          </article>

          <article className="strength-card">
            <span className="strength-label">Needs Improvement</span>

            {weakTopics.length > 0 ? (
              <>
                <h3>{weakTopics[weakTopics.length - 1].topic}</h3>
                <strong>{weakTopics[weakTopics.length - 1].average}/10</strong>
                <p>Give this topic some extra practice.</p>
              </>
            ) : (
              <p className="insight-empty">No weak topic identified yet.</p>
            )}
          </article>
        </div>
      </section>
      {/* Interview History */}
      <section className="progress-detail-card interview-history">
        <div className="history-heading">
          <div>
            <span className="analytics-eyebrow">YOUR ACTIVITY</span>
            <h2>Interview History</h2>
            <p>Review your previous practice sessions and results.</p>
          </div>

          <span className="history-count">{sessions.length} sessions</span>
        </div>

        {sessions.length > 0 ? (
          <div className="history-list">
            {sessions.slice(0, 10).map((session) => {
              const answeredQuestions = session.questions.filter(
                (question) =>
                  question.userAnswer?.trim() &&
                  question.feedback?.trim() &&
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

              const isCompleted = session.status === "Completed";

              return (
                <div className="history-item" key={session._id}>
                  <div className="history-item-main">
                    <div className="history-session-icon">
                      <TrendingUp size={19} />
                    </div>

                    <div className="history-session-info">
                      <h3>{session.jobRole || "Interview"}</h3>

                      <p>
                        {session.topic || "General"} <span>•</span>{" "}
                        {session.difficulty || "Standard"} <span>•</span>{" "}
                        {session.questions.length} questions
                      </p>

                      <span className="history-date">
                        {session.createdAt
                          ? new Date(session.createdAt).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )
                          : "Date unavailable"}
                      </span>
                    </div>
                  </div>

                  <div className="history-item-result">
                    <strong>
                      {sessionScore}
                      {sessionScore !== "--" && <small>/10</small>}
                    </strong>

                    <span
                      className={`history-status ${
                        isCompleted ? "completed" : "in-progress"
                      }`}
                    >
                      {isCompleted ? "Completed" : "In Progress"}
                    </span>
                  </div>

                  <Link
                    to={
                      isCompleted
                        ? `/results/${session._id}`
                        : `/interview/${session._id}`
                    }
                    className="history-view-link"
                  >
                    {isCompleted ? "View results" : "Continue"}
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="analytics-empty">
            <TrendingUp size={28} />
            <h3>No interview history yet</h3>
            <p>
              Your interview sessions will appear here once you start
              practising.
            </p>
            <Link to="/interview/setup" className="history-start-link">
              Start an interview
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}

export default Progress;
