import { useState } from "react";
import {
  UserRound,
  SlidersHorizontal,
  BrainCircuit,
  Palette,
  ShieldCheck,
  Settings as SettingsIcon,
} from "lucide-react";
import "./Settings.css";

const preferenceDefaults = {
  experienceLevel: "Fresher",
  interviewType: "Technical",
  difficulty: "Medium",
  count: 5,
  feedbackDetail: "Balanced",
  hintsEnabled: true,
};
const appearanceDefaults = {
  theme: "dark",
  accentColor: "purple",
};

const preferenceOptions = [
  {
    key: "experienceLevel",
    label: "Default experience level",
    options: ["Fresher", "Junior", "Mid", "Senior"],
  },
  {
    key: "interviewType",
    label: "Default interview type",
    options: ["Technical", "Behavioral"],
  },
  {
    key: "difficulty",
    label: "Default difficulty",
    options: ["Easy", "Medium", "Hard"],
  },
];

const settingsSections = [
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "interview", label: "Interview Preferences", icon: SlidersHorizontal },
  { id: "ai", label: "AI Preferences", icon: BrainCircuit },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "security", label: "Account & Security", icon: ShieldCheck },
];

function Settings() {
  const savedUser = JSON.parse(localStorage.getItem("user") || "null");

  const [activeSection, setActiveSection] = useState("profile");
  const [name, setName] = useState(savedUser?.name || "");
  const [targetRole, setTargetRole] = useState(savedUser?.targetRole || "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [preferences, setPreferences] = useState(() => {
    try {
      return {
        ...preferenceDefaults,
        ...JSON.parse(localStorage.getItem("interviewPreferences") || "{}"),
      };
    } catch {
      return preferenceDefaults;
    }
  });

  const [preferenceMessage, setPreferenceMessage] = useState("");
  const [appearance, setAppearance] = useState(() => {
    try {
      return {
        ...appearanceDefaults,
        ...JSON.parse(localStorage.getItem("appearanceSettings") || "{}"),
      };
    } catch {
      return appearanceDefaults;
    }
  });

  const [appearanceMessage, setAppearanceMessage] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Please log in again.");

      const response = await fetch("http://localhost:5000/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          targetRole: targetRole.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to update profile");

      const existingUser = JSON.parse(localStorage.getItem("user") || "{}");

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...existingUser,
          ...data.user,
          name: data.user.name,
          targetRole: data.user.targetRole,
        }),
      );

      setName(data.user.name);
      setTargetRole(data.user.targetRole);
      setMessage("Profile updated successfully!");
    } catch (err) {
      setError(err.message || "Unable to update profile.");
    }
  };

  const handleSavePreferences = () => {
    localStorage.setItem("interviewPreferences", JSON.stringify(preferences));
    setPreferenceMessage("Interview preferences saved successfully!");
  };

  const handleSaveAppearance = () => {
    localStorage.setItem("appearanceSettings", JSON.stringify(appearance));

    window.dispatchEvent(new Event("appearanceSettingsChanged"));

    setAppearanceMessage("Appearance settings saved successfully!");
  };

  const renderProfile = () => (
    <section className="settings-card">
      <div className="settings-card-heading">
        <div className="settings-profile-icon">
          <UserRound size={21} />
        </div>
        <div>
          <h2>Profile settings</h2>
          <p>Personalize your interview workspace.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="settings-form">
        <label htmlFor="profile-name">Full name</label>
        <input
          id="profile-name"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setMessage("");
          }}
          placeholder="Enter your full name"
          required
        />

        <label htmlFor="target-role">Target role</label>
        <input
          id="target-role"
          type="text"
          value={targetRole}
          onChange={(e) => {
            setTargetRole(e.target.value);
            setMessage("");
          }}
          placeholder="e.g. Frontend Developer"
        />

        <button type="submit" className="settings-save-button">
          Save changes
        </button>
        {message && (
          <p className="settings-success" role="status">
            {message}
          </p>
        )}
        {error && (
          <p className="settings-error" role="alert">
            {error}
          </p>
        )}
      </form>
    </section>
  );

  const renderInterviewPreferences = () => (
    <section className="settings-card">
      <div className="settings-card-heading">
        <div className="settings-profile-icon">
          <SlidersHorizontal size={21} />
        </div>
        <div>
          <h2>Interview preferences</h2>
          <p>Choose the defaults for your future practice sessions.</p>
        </div>
      </div>

      <div className="settings-form">
        {preferenceOptions.map(({ key, label, options }) => (
          <div className="settings-preference-field" key={key}>
            <label htmlFor={key}>{label}</label>
            <select
              id={key}
              value={preferences[key]}
              onChange={(e) => {
                setPreferences((prev) => ({ ...prev, [key]: e.target.value }));
                setPreferenceMessage("");
              }}
            >
              {options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        ))}

        <div className="settings-preference-field">
          <label htmlFor="question-count">Default number of questions</label>
          <div className="settings-count-control">
            <input
              id="question-count"
              type="range"
              min="3"
              max="10"
              value={preferences.count}
              onChange={(e) => {
                setPreferences((prev) => ({
                  ...prev,
                  count: Number(e.target.value),
                }));
                setPreferenceMessage("");
              }}
            />
            <strong>{preferences.count}</strong>
          </div>
        </div>

        <button
          type="button"
          className="settings-save-button"
          onClick={handleSavePreferences}
        >
          Save preferences
        </button>
        {preferenceMessage && (
          <p className="settings-success" role="status">
            {preferenceMessage}
          </p>
        )}
      </div>
    </section>
  );

  const renderAIPreferences = () => (
    <section className="settings-card">
      <div className="settings-card-heading">
        <div className="settings-profile-icon">
          <BrainCircuit size={21} />
        </div>
        <div>
          <h2>AI preferences</h2>
          <p>Customize how PrepForge evaluates your answers.</p>
        </div>
      </div>

      <div className="settings-form">
        <div className="settings-preference-field">
          <label htmlFor="feedback-detail">Feedback detail</label>
          <select
            id="feedback-detail"
            value={preferences.feedbackDetail}
            onChange={(e) => {
              setPreferences((prev) => ({
                ...prev,
                feedbackDetail: e.target.value,
              }));
              setPreferenceMessage("");
            }}
          >
            <option value="Concise">Concise</option>
            <option value="Balanced">Balanced</option>
            <option value="Detailed">Detailed</option>
          </select>
          <p className="settings-field-description">
            Choose how much explanation the AI provides after evaluating your
            answer.
          </p>
        </div>

        <div className="settings-ai-toggle">
          <div>
            <strong>AI hints</strong>
            <p>
              Allow AI to provide hints while answering interview questions.
            </p>
          </div>

          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={preferences.hintsEnabled}
              onChange={(e) => {
                setPreferences((prev) => ({
                  ...prev,
                  hintsEnabled: e.target.checked,
                }));
                setPreferenceMessage("");
              }}
            />
            <span className="settings-toggle-slider"></span>
          </label>
        </div>

        <button
          type="button"
          className="settings-save-button"
          onClick={handleSavePreferences}
        >
          Save AI preferences
        </button>

        {preferenceMessage && (
          <p className="settings-success" role="status">
            {preferenceMessage}
          </p>
        )}
      </div>
    </section>
  );

  const renderAppearance = () => (
    <section className="settings-card">
      <div className="settings-card-heading">
        <div className="settings-profile-icon">
          <Palette size={21} />
        </div>
        <div>
          <h2>Appearance</h2>
          <p>Personalize the look and feel of your workspace.</p>
        </div>
      </div>

      <div className="settings-form">
        <div className="settings-preference-field">
          <label htmlFor="theme">Workspace theme</label>
          <select
            id="theme"
            value={appearance.theme}
            onChange={(e) => {
              setAppearance((prev) => ({
                ...prev,
                theme: e.target.value,
              }));
              setAppearanceMessage("");
            }}
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </div>

        <div className="settings-preference-field">
          <label htmlFor="accent-color">Accent colour</label>
          <select
            id="accent-color"
            value={appearance.accentColor}
            onChange={(e) => {
              setAppearance((prev) => ({
                ...prev,
                accentColor: e.target.value,
              }));
              setAppearanceMessage("");
            }}
          >
            <option value="purple">Purple</option>
            <option value="blue">Blue</option>
            <option value="green">Green</option>
            <option value="rose">Rose</option>
          </select>
        </div>

        <button
          type="button"
          className="settings-save-button"
          onClick={handleSaveAppearance}
        >
          Save appearance
        </button>

        {appearanceMessage && (
          <p className="settings-success" role="status">
            {appearanceMessage}
          </p>
        )}
      </div>
    </section>
  );

  const renderPlaceholder = (title, description) => (
    <section className="settings-card settings-coming-soon">
      <h2>{title}</h2>
      <p>{description}</p>
      <span>We'll configure this section next.</span>
    </section>
  );

  const sectionContent = {
    profile: renderProfile,
    interview: renderInterviewPreferences,
    ai: renderAIPreferences,
    appearance: renderAppearance,
    security: () =>
      renderPlaceholder(
        "Account & Security",
        "Manage your password and account security.",
      ),
  };

  const activeItem = settingsSections.find(
    (section) => section.id === activeSection,
  );

  return (
    <main className="settings-page">
      <header className="settings-header">
        <div className="settings-icon">
          <SettingsIcon size={25} />
        </div>
        <div>
          <p>YOUR ACCOUNT</p>
          <h1>Settings</h1>
          <span>Manage your profile and workspace preferences.</span>
        </div>
      </header>

      <div className="settings-layout">
        <nav className="settings-sidebar" aria-label="Settings sections">
          {settingsSections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={`settings-nav-item ${activeSection === id ? "active" : ""}`}
              onClick={() => setActiveSection(id)}
              aria-current={activeSection === id ? "page" : undefined}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="settings-main-content">
          <div className="settings-section-title">
            <h2>{activeItem.label}</h2>
            <p>Configure your PrepForge workspace.</p>
          </div>
          {sectionContent[activeSection]()}
        </div>
      </div>
    </main>
  );
}

export default Settings;
