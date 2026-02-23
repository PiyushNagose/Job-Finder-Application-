import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearAdminSession, getAdminUser } from "../api/auth";

type PlatformSettings = {
  platformName: string;
  supportEmail: string;
  maintenance: "off" | "on";
};

export default function Settings() {
  const navigate = useNavigate();

  const C = {
    bg: "#FFFFFF",
    card: "#FFFFFF",
    surface: "#F6F6F6",
    primary: "#5B82F9",
    primaryText: "#FFFFFF",
    primarySoft: "rgba(91,130,249,0.12)",
    text: "#242424",
    muted: "#797979",
    border: "rgba(36,36,36,0.10)",
    divider: "rgba(36,36,36,0.06)",
    success: "#22C55E",
    warning: "#FFD542",
    danger: "#EF4444",
    shadow: "rgba(36,36,36,0.08)",
  };

  const admin = useMemo(() => getAdminUser(), []);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const [form, setForm] = useState<PlatformSettings>({
    platformName: "Job Finder Pro",
    supportEmail: "support@jobfinder.com",
    maintenance: "off",
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("admin_platform_settings");
      if (raw) {
        const parsed = JSON.parse(raw);
        setForm((p) => ({ ...p, ...parsed }));
      }
    } catch {}
  }, []);

  function logout() {
    clearAdminSession();
    navigate("/login", { replace: true });
  }

  function setField<K extends keyof PlatformSettings>(
    key: K,
    value: PlatformSettings[K],
  ) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  async function saveSettings() {
    setErr("");
    setOk("");

    if (!form.platformName.trim()) return setErr("Platform name is required.");
    if (!form.supportEmail.trim()) return setErr("Support email is required.");

    setSaving(true);
    try {
      localStorage.setItem("admin_platform_settings", JSON.stringify(form));
      setOk("Settings saved.");
      setTimeout(() => setOk(""), 2200);
    } catch (e: any) {
      setErr(e?.response?.data?.message || e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function resetPlatformData() {
    const ok = confirm(
      "This will reset local admin demo data (settings). Continue?",
    );
    if (!ok) return;

    localStorage.removeItem("admin_platform_settings");
    setForm({
      platformName: "Job Finder Pro",
      supportEmail: "support@jobfinder.com",
      maintenance: "off",
    });

    setOk("Reset complete.");
    setTimeout(() => setOk(""), 2200);
  }

  const pageWrap: React.CSSProperties = {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "8px 2px",
    display: "grid",
    gap: 18,
  };

  const cardStyle: React.CSSProperties = {
    background: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: 22,
    padding: 18,
    boxShadow: `0 14px 40px ${C.shadow}`,
  };

  const sectionHead: React.CSSProperties = {
    display: "grid",
    gap: 6,
    paddingBottom: 14,
    borderBottom: `1px solid ${C.divider}`,
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    height: 44,
    borderRadius: 16,
    border: `1px solid ${C.border}`,
    padding: "0 14px",
    fontWeight: 800,
    background: C.surface,
    color: C.text,
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    color: C.muted,
    fontWeight: 900,
    fontSize: 12,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    marginBottom: 6,
  };

  const btnBase: React.CSSProperties = {
    height: 44,
    borderRadius: 16,
    padding: "0 16px",
    fontWeight: 900,
    cursor: "pointer",
    border: `1px solid ${C.border}`,
    background: C.bg,
    color: C.text,
    whiteSpace: "nowrap",
  };

  const btnPrimary: React.CSSProperties = {
    ...btnBase,
    border: "none",
    background: C.primary,
    color: C.primaryText,
    boxShadow: "0 10px 24px rgba(91,130,249,0.25)",
    opacity: saving ? 0.75 : 1,
  };

  const btnDanger: React.CSSProperties = {
    ...btnBase,
    border: "1px solid rgba(239,68,68,0.25)",
    background: "rgba(239,68,68,0.10)",
    color: C.danger,
  };

  const pill = (kind: "ok" | "warn") =>
    ({
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "8px 12px",
      borderRadius: 999,
      fontWeight: 900,
      fontSize: 12,
      border:
        kind === "ok"
          ? "1px solid rgba(34,197,94,0.25)"
          : "1px solid rgba(245,158,11,0.35)",
      background:
        kind === "ok" ? "rgba(34,197,94,0.10)" : "rgba(255,213,66,0.18)",
      color: kind === "ok" ? C.success : "#8A6A00",
      whiteSpace: "nowrap",
    }) as React.CSSProperties;

  return (
    <div style={pageWrap}>
      {/* Page header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2
            style={{ margin: 0, fontWeight: 900, color: C.text, fontSize: 24 }}
          >
            Settings
          </h2>
          <div
            style={{
              color: C.muted,
              fontWeight: 800,
              fontSize: 13,
              marginTop: 4,
            }}
          >
            Manage platform configuration + admin profile
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button style={btnBase} onClick={logout}>
            Logout
          </button>
          <button style={btnPrimary} onClick={saveSettings} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* Alerts */}
      {err ? (
        <div
          style={{
            padding: 12,
            borderRadius: 16,
            background: "rgba(239,68,68,0.10)",
            border: "1px solid rgba(239,68,68,0.25)",
            color: C.danger,
            fontWeight: 900,
          }}
        >
          {err}
        </div>
      ) : null}

      {ok ? (
        <div
          style={{
            padding: 12,
            borderRadius: 16,
            background: "rgba(34,197,94,0.08)",
            border: "1px solid rgba(34,197,94,0.25)",
            color: C.text,
            fontWeight: 900,
          }}
        >
          {ok}
        </div>
      ) : null}

      {/* Admin Profile */}
      <div style={cardStyle}>
        <div style={sectionHead}>
          <div style={{ fontWeight: 900, color: C.text }}>Admin Profile</div>
          <div style={{ color: C.muted, fontWeight: 800, fontSize: 13 }}>
            Signed in admin details
          </div>
        </div>

        <div
          style={{
            marginTop: 14,
            display: "grid",
            gap: 12,
            gridTemplateColumns: "1fr 1fr",
          }}
        >
          <div>
            <div style={labelStyle}>Name</div>
            <input style={inputStyle} value={admin?.name ?? "—"} readOnly />
          </div>

          <div>
            <div style={labelStyle}>Role</div>
            <input style={inputStyle} value={admin?.role ?? "admin"} readOnly />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <div style={labelStyle}>Email</div>
            <input style={inputStyle} value={admin?.email ?? "—"} readOnly />
          </div>
        </div>
      </div>

      {/* Platform Configuration */}
      <div style={cardStyle}>
        <div style={sectionHead}>
          <div style={{ fontWeight: 900, color: C.text }}>
            Platform Configuration
          </div>
          <div style={{ color: C.muted, fontWeight: 800, fontSize: 13 }}>
            Manage global settings for your job platform.
          </div>
        </div>

        <div
          style={{
            marginTop: 14,
            display: "grid",
            gap: 12,
            gridTemplateColumns: "1fr 1fr",
          }}
        >
          <div style={{ gridColumn: "1 / -1" }}>
            <div style={labelStyle}>Platform Name</div>
            <input
              style={inputStyle}
              value={form.platformName}
              onChange={(e) => setField("platformName", e.target.value)}
              placeholder="Job Finder Pro"
            />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <div style={labelStyle}>Support Email</div>
            <input
              style={inputStyle}
              value={form.supportEmail}
              onChange={(e) => setField("supportEmail", e.target.value)}
              placeholder="support@jobfinder.com"
            />
          </div>

          <div>
            <div style={labelStyle}>Maintenance Mode</div>
            <select
              style={inputStyle}
              value={form.maintenance}
              onChange={(e) => setField("maintenance", e.target.value as any)}
            >
              <option value="off">Off</option>
              <option value="on">On</option>
            </select>

            <div
              style={{
                marginTop: 8,
                color: C.muted,
                fontWeight: 800,
                fontSize: 13,
              }}
            >
              When ON, show maintenance banner in mobile app (later).
            </div>
          </div>

          <div>
            <div style={labelStyle}>Status</div>
            <div style={{ marginTop: 10 }}>
              <span
                style={form.maintenance === "on" ? pill("warn") : pill("ok")}
              >
                {form.maintenance === "on"
                  ? "Maintenance Enabled"
                  : "Running Normally"}
              </span>
            </div>
          </div>
        </div>

        <button
          style={{ ...btnPrimary, width: "100%", marginTop: 16, height: 48 }}
          onClick={saveSettings}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      {/* Danger Zone */}
      <div
        style={{
          ...cardStyle,
          border: "1px solid rgba(239,68,68,0.18)",
          background: "linear-gradient(0deg, rgba(239,68,68,0.06), #fff)",
        }}
      >
        <div style={{ fontWeight: 900, color: C.text }}>Danger Zone</div>
        <div
          style={{
            color: C.muted,
            fontWeight: 800,
            marginTop: 6,
            fontSize: 13,
          }}
        >
          Stage-1 resets only local demo settings. Stage-2 can reset MongoDB.
        </div>

        <div
          style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}
        >
          <button style={btnDanger} onClick={resetPlatformData}>
            Reset Platform Data
          </button>
        </div>
      </div>

      {/* Responsive fix for grid */}
      <style>{`
        @media (max-width: 720px) {
          .settingsGrid2 {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
