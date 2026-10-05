import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

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
      (question) => typeof question.score === "number",
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

  return (
    <main>
      <h1>Results</h1>

      {session && (
        <div>
          <p>Role: {session.jobRole}</p>
          <p>Interview Type: {session.interviewType}</p>
          <p>Difficulty: {session.difficulty}</p>
          <p>Questions: {session.questions.length}</p>
          <p>
            Evaluated: {evaluatedCount}/{totalQuestions}
          </p>
          <p>Average Score: {averageScore.toFixed(1)}/10</p>
          <p>Performance: {performance}</p>

          <h2>Question Results</h2>

          {session.questions.map((question, index) => (
            <div key={question._id}>
              <h3>Question {index + 1}</h3>

              <p>{question.question}</p>

              <h4>Your Answer</h4>
              <p>{question.userAnswer || "No answer submitted"}</p>

              <p>Score: {question.score}/10</p>

              <h4>AI Feedback</h4>
              <p>{question.feedback || "Not evaluated"}</p>
            </div>
          ))}
        </div>
      )}

      <button type="button" onClick={() => navigate("/dashboard")}>
        Back to Dashboard
      </button>
    </main>
  );
}

export default Results;
