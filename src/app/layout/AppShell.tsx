import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/entities/auth/model/AuthContext";

export default function AppShell() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <>
      <nav className="app-navbar" aria-label="Primary navigation">
        <Link className="app-brand" to="/">
          <span className="app-brand-mark">S</span>
          <span>
            <strong>Stacklivo</strong>
            <small>Practice workspace</small>
          </span>
        </Link>

        <div className="app-nav-links">
          <NavLink to="/" end>
            Practice
          </NavLink>
          <NavLink to="/projects">
            Projects
          </NavLink>
        </div>

        <div className="app-nav-account">
          {currentUser ? (
            <>
              <span className="nav-user-chip">{currentUser.name}</span>
              <button className="nav-auth-button" type="button" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink className="nav-auth-link" to="/login" state={{ from: location }}>
                Login
              </NavLink>
              <NavLink className="nav-auth-button" to="/signup">
                Sign up
              </NavLink>
            </>
          )}
        </div>
      </nav>

      <Outlet />
    </>
  );
}
