import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/entities/auth/model/AuthContext";

export default function LoginPage() {
  const { currentUser, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  if (currentUser) {
    return <Navigate to="/projects" replace />;
  }

  const from = location.state?.from?.pathname || "/projects";

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    try {
      login(form);
      navigate(from, { replace: true });
    } catch (authError) {
      setError(authError.message);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="dashboard-kicker">Welcome back</p>
        <h1>Login to Stacklivo</h1>
        <p>Use your local account to keep this browser’s saved projects separate.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input name="email" type="email" value={form.email} onChange={handleChange} required />
          </label>

          <label>
            Password
            <input name="password" type="password" value={form.password} onChange={handleChange} required />
          </label>

          {error ? <div className="auth-error">{error}</div> : null}

          <button className="button primary" type="submit">
            Login
          </button>
        </form>

        <p className="auth-switch">
          New here? <Link to="/signup">Create an account</Link>
        </p>
      </section>
    </main>
  );
}
