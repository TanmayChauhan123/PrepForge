import "./Results.css";
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { CheckCircle2, Sparkles } from "lucide-react";
import prepforgeLogo from "../assets/prepforge.jpg";

function Results() {
  const navigate = useNavigate();
  const { sessionId } = useParams();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Please login again.");
          setLoading(false);
          return;
        }

        const response = await fetch(
          `http://localhost:5000/api/interviews/${sessionId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load results");
        }

        setSession(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  if (loading) {
    return <div>Loading results...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const scoredQuestions =
    session?.questions?.filter(
      (question) =>
        question.userAnswer?.trim() &&
        typeof question.score === "number" &&
        question.feedback?.trim(),
    ) || [];

  const totalScore = scoredQuestions.reduce(
    (sum, question) => sum + question.score,
    0,
  );

  const averageScore =
    scoredQuestions.length > 0 ? totalScore / scoredQuestions.length : 0;
  let performance = "Needs Practice";

  if (averageScore >= 8) {
    performance = "Excellent";
  } else if (averageScore >= 6) {
    performance = "Good";
  } else if (averageScore >= 4) {
    performance = "Needs Improvement";
  }
  const evaluatedCount = scoredQuestions.length;
  const totalQuestions = session?.questions?.length || 0;
  let insight = "";

  if (averageScore >= 8) {
    insight =
      "Strong performance. Keep practicing with deeper follow-up questions and real-world scenarios to sharpen your interview readiness.";
  } else if (averageScore >= 6) {
    insight =
      "Good foundation. Focus on adding more specific examples, technical details, and clearer explanations to strengthen your answers.";
  } else if (averageScore >= 4) {
    insight =
      "You have a starting foundation. Review the core concepts and practice explaining them in your own words before attempting harder questions.";
  } else {
    insight =
      "This session highlights areas that need more practice. Focus on understanding the fundamentals and build confidence with easier questions first.";
  }

  return (
    <main className="results-page">
      <div className="results-container">
        {session && (
          <div>
            <section className="results-hero">
              <div className="results-hero-icon">
                <CheckCircle2 size={28} />
              </div>

              <div>
                <p className="results-eyebrow">INTERVIEW COMPLETE</p>

                <h1>Great work. Here's your performance.</h1>

                <p className="results-subtitle">
                  {session.jobRole} · {session.interviewType} ·{" "}
                  {session.difficulty}
                </p>
              </div>
            </section>
            <section className="results-stats">
              <div className="results-stat-card score-card">
                <div
                  className={`score-ring score-${performance
                    .toLowerCase()
                    .replace(" ", "-")}`}
                  style={{ "--score": averageScore }}
                >
                  <div className="score-ring-inner">
                    <strong>{averageScore.toFixed(1)}</strong>
                    <span>/10</span>
                  </div>
                </div>

                <div className="score-card-info">
                  <span className="results-stat-label">AVERAGE SCORE</span>
                  <span className="results-stat-caption">
                    Overall performance
                  </span>
                </div>
              </div>

              <div className="results-stat-card">
                <span className="results-stat-label">QUESTIONS</span>
                <strong>
                  {evaluatedCount}
                  <small>/{totalQuestions}</small>
                </strong>
                <span className="results-stat-caption">Evaluated</span>
              </div>

              <div className="results-stat-card">
                <span className="results-stat-label">PERFORMANCE</span>
                <strong className="results-performance">{performance}</strong>
                <span className="results-stat-caption">AI assessment</span>
              </div>
            </section>

            <section className="results-insight">
              <div className="insight-icon">
                <Sparkles size={18} />
              </div>

              <div>
                <p className="insight-label">PREPFORGE INSIGHT</p>
                <h2>Your next step</h2>
                <p>{insight}</p>
              </div>
            </section>

            <section className="question-results">
              <div className="section-heading">
                <div>
                  <p className="section-eyebrow">DETAILED BREAKDOWN</p>
                  <h2>Question Results</h2>
                </div>

                <span className="question-count">
                  {totalQuestions} questions
                </span>
              </div>

              <div className="question-list">
                {session.questions.map((question, index) => (
                  <article className="question-card" key={question._id}>
                    <div className="question-card-top">
                      <span className="question-number">
                        Q{String(index + 1).padStart(2, "0")}
                      </span>

                      <span className="question-score">
                        {question.userAnswer?.trim() &&
                        question.feedback?.trim()
                          ? `${question.score}/10`
                          : "Not evaluated"}
                      </span>
                    </div>

                    <h3>{question.question}</h3>

                    <div className="answer-block">
                      <p className="answer-label">YOUR RESPONSE</p>
                      <p className="answer-text">
                        {question.userAnswer || "No answer submitted"}
                      </p>
                    </div>

                    <div className="feedback-block">
                      <div className="feedback-heading">
                        <Sparkles size={15} />
                        <span>AI FEEDBACK</span>
                      </div>

                      <p>{question.feedback || "Not evaluated"}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        )}
        <div className="results-actions">
          <button
            type="button"
            className="results-action results-action-primary"
            onClick={() => navigate("/interview/setup")}
          >
            Practice Again
          </button>

          <button
            type="button"
            className="results-action results-action-secondary"
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </main>
  );
}

export default Results;
