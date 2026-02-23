import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminSignup } from "../api/auth";

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("Admin");
  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const canSubmit =
    name.trim().length > 1 &&
    email.trim().length > 3 &&
    password.trim().length >= 6;

  const submit = async () => {
    if (!canSubmit || loading) return;

    setErr("");
    setLoading(true);

    try {
      await adminSignup(name.trim(), email.trim(), password);
      navigate("/", { replace: true });
    } catch (e: any) {
      setErr(
        e?.response?.data?.message ||
          e?.message ||
          "Signup failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const C = {
    bg: "#FFFFFF",
    card: "#FFFFFF",
    text: "#242424",
    muted: "#797979",
    border: "rgba(36,36,36,0.10)",
    divider: "rgba(36,36,36,0.06)",
    primary: "#5B82F9",
    primarySoft: "rgba(91,130,249,0.12)",
    danger: "#EF4444",
  };

  return (
    <div
      className="authWrap"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: C.bg,
      }}
    >
      <div
        className="authCard"
        style={{
          width: 420,
          maxWidth: "100%",
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 28,
          padding: 28,
          boxShadow: "0 20px 50px rgba(36,36,36,0.08)",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 18,
              margin: "0 auto 14px",
              background: C.primarySoft,
              border: "1px solid rgba(91,130,249,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              color: C.primary,
              fontSize: 20,
            }}
          >
            A
          </div>

          <h1
            style={{
              margin: 0,
              color: C.text,
              fontWeight: 900,
              fontSize: 26,
              letterSpacing: -0.2,
            }}
          >
            Admin Sign up
          </h1>

          <p
            style={{
              margin: "8px 0 0",
              color: C.muted,
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            Create your admin account
          </p>
        </div>

        {/* Name */}
        <label
          style={{
            color: C.muted,
            fontWeight: 900,
            fontSize: 12,
            display: "block",
            marginBottom: 8,
          }}
        >
          Name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          style={{
            width: "100%",
            height: 46,
            borderRadius: 16,
            border: `1px solid ${C.border}`,
            background: C.card,
            padding: "0 14px",
            fontWeight: 800,
            color: C.text,
            outline: "none",
          }}
        />

        {/* Email */}
        <label
          style={{
            color: C.muted,
            fontWeight: 900,
            fontSize: 12,
            display: "block",
            marginBottom: 8,
            marginTop: 16,
          }}
        >
          Email
        </label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          style={{
            width: "100%",
            height: 46,
            borderRadius: 16,
            border: `1px solid ${C.border}`,
            background: C.card,
            padding: "0 14px",
            fontWeight: 800,
            color: C.text,
            outline: "none",
          }}
        />

        {/* Password */}
        <label
          style={{
            color: C.muted,
            fontWeight: 900,
            fontSize: 12,
            display: "block",
            marginBottom: 8,
            marginTop: 16,
          }}
        >
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          style={{
            width: "100%",
            height: 46,
            borderRadius: 16,
            border: `1px solid ${C.border}`,
            background: C.card,
            padding: "0 14px",
            fontWeight: 800,
            color: C.text,
            outline: "none",
          }}
        />

        {/* Error */}
        {err ? (
          <div
            style={{
              marginTop: 16,
              padding: "12px 14px",
              borderRadius: 16,
              border: "1px solid rgba(239,68,68,0.25)",
              background: "rgba(239,68,68,0.10)",
              color: C.danger,
              fontWeight: 900,
              fontSize: 13,
            }}
          >
            {err}
          </div>
        ) : null}

        {/* Submit */}
        <button
          onClick={submit}
          disabled={loading || !canSubmit}
          style={{
            width: "100%",
            height: 48,
            marginTop: 20,
            borderRadius: 18,
            border: "1px solid rgba(91,130,249,0.25)",
            background: canSubmit ? C.primary : C.primarySoft,
            color: canSubmit ? "#fff" : C.muted,
            fontWeight: 900,
            cursor: loading || !canSubmit ? "not-allowed" : "pointer",
            boxShadow: canSubmit ? "0 12px 26px rgba(91,130,249,0.22)" : "none",
          }}
        >
          {loading ? "Creating..." : "Create account"}
        </button>

        {/* Link */}
        <div
          style={{
            marginTop: 18,
            textAlign: "center",
            fontWeight: 800,
            fontSize: 13,
          }}
        >
          <span style={{ color: C.muted }}>Already have account? </span>
          <Link
            to="/login"
            style={{
              color: C.primary,
              fontWeight: 900,
              textDecoration: "none",
            }}
          >
            Sign in
          </Link>
        </div>

        <div
          style={{
            marginTop: 22,
            height: 1,
            background: C.divider,
          }}
        />
      </div>
    </div>
  );
}
