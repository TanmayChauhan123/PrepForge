import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Interview.css";
import prepforgeLogo from "../assets/prepforge.jpg";
import { ArrowRight, Sparkles } from "lucide-react";

function Interview() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState(null);
  const [evaluating, setEvaluating] = useState(false);

  const [hintVisible, setHintVisible] = useState(false);
  const [hint, setHint] = useState("");
  const [hintLoading, setHintLoading] = useState(false);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const currentQuestion = session?.questions?.[currentQuestionIndex];

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
          throw new Error(data.message || "Failed to load interview");
        }

        setSession(data);
        console.log("Interview session:", data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);
  useEffect(() => {
    setAnswer("");
    setEvaluation(null);
    setHintVisible(false);
    setHint("");
  }, [currentQuestionIndex]);

  const handleEvaluate = async () => {
    if (!answer.trim()) {
      setError("Please write an answer before evaluating.");
      return;
    }

    setEvaluating(true);

    try {
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login again.");
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/interviews/${sessionId}/questions/${currentQuestion._id}/evaluate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userAnswer: answer,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to evaluate answer");
      }

      setEvaluation(data.question);
      console.log("Evaluation:", data);
    } catch (error) {
      setError(error.message);
    } finally {
      setEvaluating(false);
    }
  };

  const handleHint = async () => {
    if (!currentQuestion) return;

    try {
      setHintLoading(true);
      setHintVisible(true);
      setHint("");
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login again.");
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/interviews/${sessionId}/questions/${currentQuestion._id}/hint`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to generate hint");
      }

      setHint(data.hint);
    } catch (error) {
      setHint("");
      setError(error.message);
    } finally {
      setHintLoading(false);
    }
  };

  return (
    <main className="interview-page">
      <div className="interview-container">
        <header className="interview-header">
          <div className="interview-brand">
            <img
              src={prepforgeLogo}
              alt="PrepForge"
              className="interview-brand-logo"
            />
            <span>PrepForge AI</span>
          </div>

          <div className="interview-status">
            <span className="status-dot"></span>
            LIVE INTERVIEW
          </div>
        </header>

        {session && (
          <div>
            <section className="interview-intro">
              <div>
                <p className="interview-eyebrow">AI PRACTICE SESSION</p>

                <h1>Interview</h1>

                <p className="interview-subtitle">
                  {session.jobRole} · {session.interviewType} ·{" "}
                  {session.difficulty}
                </p>
              </div>

              <div className="interview-progress">
                <span>Question {currentQuestionIndex + 1}</span>
                <strong> / {session.questions.length}</strong>
              </div>
            </section>

            {session.questions && session.questions.length > 0 && (
              <div>
                <div className="question-workspace">
                  <div className="question-label">
                    <span>
                      QUESTION{" "}
                      {String(currentQuestionIndex + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <h2>{currentQuestion.question}</h2>

                  <p className="question-helper">
                    Take your time and explain your reasoning clearly.
                  </p>

                  <button
                    type="button"
                    className="hint-button"
                    onClick={handleHint}
                    disabled={hintLoading}
                  >
                    <Sparkles size={15} />

                    <span>{hintLoading ? "Thinking..." : "Get AI Hint"}</span>
                  </button>

                  {hintVisible && (
                    <div className="hint-card">
                      <div className="hint-card-icon">
                        <Sparkles size={16} />
                      </div>

                      <div>
                        <p className="hint-card-label">AI HINT</p>

                        <p className="hint-card-text">
                          {hintLoading
                            ? "Thinking about a useful direction..."
                            : hint}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="interview-answer">
                  <label className="answer-editor-label">YOUR ANSWER</label>

                  <textarea
                    placeholder="Type your answer here..."
                    rows="8"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className="evaluate-button"
                  onClick={handleEvaluate}
                  disabled={evaluating}
                >
                  {evaluating ? (
                    <>
                      Evaluating
                      <span className="loading-dots">
                        <span>.</span>
                        <span>.</span>
                        <span>.</span>
                      </span>
                    </>
                  ) : (
                    "Evaluate Answer"
                  )}
                </button>
                {evaluation && (
                  <div>
                    <h2>AI Feedback</h2>

                    <p>Score: {evaluation.score}/10</p>

                    <p>{evaluation.feedback}</p>
                  </div>
                )}
                {evaluation && (
                  <>
                    {currentQuestionIndex < session.questions.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentQuestionIndex((prev) => prev + 1);
                          setAnswer("");
                          setEvaluation(null);
                        }}
                      >
                        Next Question
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => navigate(`/results/${sessionId}`)}
                      >
                        Finish Interview
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default Interview;
