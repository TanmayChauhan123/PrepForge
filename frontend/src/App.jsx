import { BrowserRouter, Routes, Route } from "react-router-dom";
import Progress from "./pages/Progress";
import Sessions from "./pages/Sessions";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import InterviewSetup from "./pages/InterviewSetup";
import Interview from "./pages/Interview";
import Results from "./pages/Results";
import Settings from "./pages/Settings";
import AppLayout from "./components/AppLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/interview/setup" element={<InterviewSetup />} />
          <Route path="/interview/:sessionId" element={<Interview />} />
          <Route path="/results/:sessionId" element={<Results />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
