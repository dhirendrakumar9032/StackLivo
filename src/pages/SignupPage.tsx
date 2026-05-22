import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/entities/auth/model/AuthContext";

export default function SignupPage() {
  const { currentUser, signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  if (currentUser) {
    return <Navigate to="/projects" replace />;
  }

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    try {
      signup(form);
      navigate("/projects", { replace: true });
    } catch (authError) {
      setError(authError.message);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="dashboard-kicker">Start saving</p>
        <h1>Create your account</h1>
        <p>This is local-only for now, so it is perfect for development and easy to replace with backend auth later.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Name
            <input name="name" type="text" value={form.name} onChange={handleChange} required />
          </label>

          <label>
            Email
            <input name="email" type="email" value={form.email} onChange={handleChange} required />
          </label>

          <label>
            Password
            <input
              name="password"
              type="password"
              minLength={6}
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>

          {error ? <div className="auth-error">{error}</div> : null}

          <button className="button primary" type="submit">
            Sign up
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </section>
    </main>
  );
}
