import { useState } from "react";
import { Link } from "react-router-dom";
import { Settings as SettingsIcon, UserRound } from "lucide-react";
import "./Settings.css";

function Settings() {
  const savedUser = JSON.parse(localStorage.getItem("user") || "null");

  const [name, setName] = useState(savedUser?.name || "");
  const [targetRole, setTargetRole] = useState(savedUser?.targetRole || "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem("token");

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

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

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

  return (
    <main className="settings-page">
      <header className="settings-header">
        <div className="settings-icon">
          <SettingsIcon size={25} />
        </div>

        <div>
          <p>YOUR ACCOUNT</p>
          <h1>Settings</h1>
          <span>Manage your profile and preferences.</span>
        </div>
      </header>

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
            onChange={(event) => {
              setName(event.target.value);
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
            onChange={(event) => {
              setTargetRole(event.target.value);
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
    </main>
  );
}

export default Settings;
