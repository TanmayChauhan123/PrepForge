import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  BrainCircuit,
  BriefcaseBusiness,
  ChevronDown,
  Code2,
  Layers3,
  Sparkles,
  Target,
} from "lucide-react";
import { Link } from "react-router-dom";
import "./InterviewSetup.css";
import prepforgeLogo from "../assets/prepforge.jpg";

function InterviewSetup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    jobRole: "",
    experienceLevel: "Fresher",
    interviewType: "Technical",
    topic: "",
    difficulty: "Medium",
    count: 5,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.jobRole.trim()) {
      setError("Please enter your target role.");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/interviews/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to generate interview");
      }

      console.log("Generated interview:", data);
      navigate(`/interview/${data.session._id}`);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="setup-page">
      <div className="setup-background">
        <div className="setup-glow setup-glow-one"></div>
        <div className="setup-glow setup-glow-two"></div>
      </div>

      <div className="setup-container">
        {/* Top navigation */}
        <header className="setup-header">
          <Link to="/dashboard" className="setup-back">
            <ArrowLeft size={16} />
            Dashboard
          </Link>

          <div className="setup-brand">
            <img
              src={prepforgeLogo}
              alt="PrepForge"
              className="setup-brand-logo"
            />
            <span>PrepForge AI</span>
          </div>
        </header>

        {/* Intro */}
        <section className="setup-intro">
          <div className="setup-intro-icon">
            <BrainCircuit size={27} />
          </div>

          <p className="setup-eyebrow">AI INTERVIEW BUILDER</p>

          <h1>
            Build your
            <span> perfect practice session.</span>
          </h1>

          <p>
            Tell PrepForge what you're preparing for and we'll generate a
            personalized interview around it.
          </p>
        </section>

        {/* Setup card */}
        <section className="setup-card">
          <div className="setup-card-header">
            <div>
              <p className="setup-card-label">INTERVIEW CONFIGURATION</p>
              <h2>Customize your session</h2>
            </div>

            <div className="setup-step">
              <span>01</span>
              <div></div>
              <span>02</span>
            </div>
          </div>

          <form className="setup-form" onSubmit={handleSubmit}>
            {/* Target role */}
            <div className="setup-field setup-field-full">
              <label htmlFor="jobRole">
                <BriefcaseBusiness size={15} />
                Target role
              </label>

              <input
                id="jobRole"
                name="jobRole"
                type="text"
                placeholder="e.g. Backend Developer"
                value={formData.jobRole}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    jobRole: e.target.value,
                  })
                }
              />

              <span className="field-hint">
                The role you're preparing to interview for.
              </span>
            </div>

            {/* Experience */}
            <div className="setup-field">
              <label htmlFor="experienceLevel">
                <Layers3 size={15} />
                Experience level
              </label>

              <div className="select-wrapper">
                <select
                  id="experienceLevel"
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      experienceLevel: e.target.value,
                    })
                  }
                >
                  <option value="Fresher">Fresher</option>
                  <option value="Junior">Junior</option>
                  <option value="Mid">Mid</option>
                  <option value="Senior">Senior</option>
                </select>

                <ChevronDown size={16} />
              </div>
            </div>

            {/* Interview type */}
            <div className="setup-field">
              <label htmlFor="interviewType">
                <Target size={15} />
                Interview type
              </label>

              <div className="select-wrapper">
                <select
                  id="interviewType"
                  name="interviewType"
                  value={formData.interviewType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      interviewType: e.target.value,
                    })
                  }
                >
                  <option value="Technical">Technical</option>
                  <option value="Behavioral">Behavioral</option>
                </select>

                <ChevronDown size={16} />
              </div>
            </div>

            {/* Topic */}
            <div className="setup-field">
              <label htmlFor="topic">
                <Code2 size={15} />
                Topic
              </label>

              <input
                id="topic"
                name="topic"
                type="text"
                placeholder="e.g. Node.js & Express"
                value={formData.topic}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    topic: e.target.value,
                  })
                }
              />
            </div>

            {/* Difficulty */}
            <div className="setup-field">
              <label htmlFor="difficulty">
                <Target size={15} />
                Difficulty
              </label>

              <div className="select-wrapper">
                <select
                  id="difficulty"
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      difficulty: e.target.value,
                    })
                  }
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>

                <ChevronDown size={16} />
              </div>
            </div>

            {/* Question count */}
            <div className="setup-field setup-field-full">
              <div className="question-heading">
                <label htmlFor="count">
                  <BrainCircuit size={15} />
                  Number of questions
                </label>

                <strong>{formData.count}</strong>
              </div>

              <input
                id="count"
                name="count"
                type="range"
                min="3"
                max="10"
                value={formData.count}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    count: Number(e.target.value),
                  })
                }
              />

              <div className="range-labels">
                <span>3 questions</span>
                <span>10 questions</span>
              </div>
            </div>

            {/* AI notice */}
            <div className="ai-notice">
              <div className="ai-notice-icon">
                <Sparkles size={18} />
              </div>

              <div>
                <strong>AI-powered session</strong>

                <p>
                  PrepForge will generate questions specifically around your
                  selected role, experience, topic, and difficulty.
                </p>
              </div>
            </div>
            {error && <div className="setup-error">{error}</div>}

            <button
              type="submit"
              className="generate-button"
              disabled={loading}
            >
              <Sparkles size={17} />
              <span>
                {loading ? (
                  <>
                    Generating
                    <span className="loading-dots">
                      <span>.</span>
                      <span>.</span>
                      <span>.</span>
                    </span>
                  </>
                ) : (
                  "Generate interview"
                )}
              </span>
            </button>
          </form>
        </section>

        <p className="setup-footer">
          Powered by local AI · Your preparation stays on your machine
        </p>
      </div>
    </main>
  );
}

export default InterviewSetup;
