import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Play,
  TrendingUp,
  Gauge,
  Settings as SettingsIcon,
  LogOut,
} from "lucide-react";
import prepforgeLogo from "../assets/prepforge.jpg";
import "./AppLayout.css";

function AppLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Practice", path: "/interview/setup", icon: Play },
    { label: "Progress", path: "/progress", icon: TrendingUp },
    { label: "Sessions", path: "/sessions", icon: Gauge },
    { label: "Settings", path: "/settings", icon: SettingsIcon },
  ];

  return (
    <div className="app-layout">
      <aside className="app-sidebar">
        <div className="app-sidebar-brand">
          <img src={prepforgeLogo} alt="PrepForge" />
          <span>PrepForge</span>
        </div>

        <p className="sidebar-section-label">WORKSPACE</p>

        <nav className="sidebar-navigation">
          {navItems.slice(0, 4).map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/dashboard"}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "active" : ""}`
                }
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <p className="sidebar-section-label sidebar-account-label">ACCOUNT</p>

        <nav className="sidebar-navigation">
          {navItems.slice(4).map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "active" : ""}`
                }
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <button type="button" className="sidebar-logout" onClick={handleLogout}>
          <LogOut size={17} />
          <span>Log out</span>
        </button>
      </aside>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
