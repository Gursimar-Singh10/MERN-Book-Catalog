import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { errorMessage } from "../api";
import Spinner from "../components/Spinner";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await register(form.username, form.email, form.password);
      navigate("/login");
    } catch (err) {
      setError(errorMessage(err, "Could not create account"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth">
      <h1>Create account</h1>
      <p className="muted">Passwords need at least 6 characters.</p>
      <form onSubmit={submit}>
        <label>Username
          <input value={form.username} onChange={set("username")} required minLength={3} autoComplete="username" />
        </label>
        <label>Email
          <input type="email" value={form.email} onChange={set("email")} required autoComplete="email" />
        </label>
        <label>Password
          <input type="password" value={form.password} onChange={set("password")} required minLength={6} autoComplete="new-password" />
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn primary" disabled={busy}>{busy ? <Spinner label="Creating account" /> : "Create account"}</button>
      </form>
      <p className="muted">Already registered? <Link to="/login">Sign in</Link></p>
    </main>
  );
}
