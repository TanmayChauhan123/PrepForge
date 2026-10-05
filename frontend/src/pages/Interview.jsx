import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function Interview() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
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

  return (
    <main className="interview-page">
      <h1>Interview</h1>

      {session && (
        <div>
          <p>Role: {session.jobRole}</p>
          <p>Type: {session.interviewType}</p>
          <p>Difficulty: {session.difficulty}</p>

          {session.questions && session.questions.length > 0 && (
            <div>
              <h2>Question {currentQuestionIndex + 1}</h2>
              <p>{currentQuestion.question}</p>
              <textarea
                placeholder="Type your answer here..."
                rows="8"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
              />
              <button
                type="button"
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
    </main>
  );
}

export default Interview;
