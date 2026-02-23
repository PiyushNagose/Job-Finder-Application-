import { useEffect, useState } from "react";
import { getDashboard } from "../api/dashboard";

type Company = { _id: string; name: string };

type RecentJob = {
  _id: string;
  title: string;
  company?: string | Company;
  location?: string;
  status?: "active" | "paused";
  createdAt?: string;
};

function companyLabel(c?: RecentJob["company"]) {
  if (!c) return "—";
  if (typeof c === "string") return c; 
  return c.name;
}

function StatCard({ label, value }: { label: string; value: number }) {
  const C = {
    primary: "#5B82F9",
    border: "rgba(36,36,36,0.10)",
    muted: "#797979",
  };

  return (
    <div
      style={{
        borderRadius: 22,
        border: `1px solid ${C.border}`,
        padding: 22,
        boxShadow: "0 12px 30px rgba(36,36,36,0.05)",
        background: "#fff",
      }}
    >
      <div
        style={{
          fontWeight: 900,
          fontSize: 12,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: C.muted,
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: 8,
          fontWeight: 900,
          fontSize: 28,
          color: C.primary,
          letterSpacing: "-0.02em",
        }}
      >
        {value.toLocaleString()}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [stats, setStats] = useState({
    users: 0,
    companies: 0,
    jobs: 0,
    activeJobs: 0,
  });

  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);

  const C = {
    border: "rgba(36,36,36,0.10)",
    divider: "rgba(36,36,36,0.06)",
    muted: "#797979",
    text: "#242424",
    danger: "#EF4444",
    success: "#22C55E",
    warning: "#FFD542",
    surface: "#F6F6F6",
  };

  const pillStyle = (s?: RecentJob["status"]) => {
    const active = (s ?? "active") === "active";
    return {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "8px 12px",
      borderRadius: 999,
      fontWeight: 900,
      fontSize: 12,
      border: `1px solid ${
        active ? "rgba(34,197,94,0.25)" : "rgba(255,213,66,0.35)"
      }`,
      background: active ? "rgba(34,197,94,0.10)" : "rgba(255,213,66,0.14)",
      color: active ? C.success : "#8A6A00",
      whiteSpace: "nowrap",
    } as const;
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const data = await getDashboard();
        setStats(data.stats);
        setRecentJobs((data.recentJobs || []) as any);
      } catch (e: any) {
        setErr(e?.response?.data?.message || e.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="stack" style={{ gap: 18 }}>
      {/* Page head */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: 0, fontWeight: 900, letterSpacing: "-0.02em", fontSize: 24 }}>
            Dashboard
          </h2>
          <div style={{ marginTop: 4, color: C.muted, fontWeight: 800, fontSize: 13 }}>
            Overview of platform activity
          </div>
        </div>

        <div
          style={{
            height: 40,
            padding: "0 12px",
            borderRadius: 14,
            border: `1px solid ${C.border}`,
            background: "#fff",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontWeight: 900,
            color: C.muted,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              background: loading ? C.warning : C.success,
              display: "inline-block",
            }}
          />
          {loading ? "Loading" : "Live"}
        </div>
      </div>

      {/* Error */}
      {err ? (
        <div
          style={{
            padding: "12px 14px",
            borderRadius: 16,
            border: "1px solid rgba(239,68,68,0.25)",
            background: "rgba(239,68,68,0.10)",
            color: C.danger,
            fontWeight: 900,
          }}
        >
          {err}
        </div>
      ) : null}

      {/* Stats */}
      <div className="grid4" style={{ gap: 20 }}>
        <StatCard label="Total Users" value={stats.users} />
        <StatCard label="Companies" value={stats.companies} />
        <StatCard label="Jobs" value={stats.jobs} />
        <StatCard label="Active Jobs" value={stats.activeJobs} />
      </div>

      {/* Recent Jobs */}
      <div
        style={{
          borderRadius: 22,
          border: `1px solid ${C.border}`,
          padding: 18,
          background: "#fff",
          boxShadow: "0 14px 40px rgba(36,36,36,0.05)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 18, color: C.text }}>
              Recently Added Jobs
            </div>
            <div style={{ marginTop: 4, fontWeight: 800, fontSize: 13, color: C.muted }}>
              Latest 8 jobs from MongoDB
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={{ marginTop: 14 }}>
          <div
            className="dashGrid"
            style={{
              display: "grid",
              gridTemplateColumns: "110px 2fr 1.6fr 1.2fr 1fr 1fr",
              gap: 12,
              padding: "12px 12px",
              color: C.muted,
              fontWeight: 900,
              fontSize: 12,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              borderBottom: `1px solid ${C.divider}`,
            }}
          >
            <div>ID</div>
            <div>Title</div>
            <div>Company</div>
            <div>Location</div>
            <div>Status</div>
            <div>Posted</div>
          </div>

          {loading ? (
            <div style={{ padding: 18, textAlign: "center", color: C.muted, fontWeight: 900 }}>
              Loading dashboard…
            </div>
          ) : recentJobs.length === 0 ? (
            <div style={{ padding: 18, textAlign: "center", color: C.muted, fontWeight: 900 }}>
              No jobs found.
            </div>
          ) : (
            recentJobs.map((j) => (
              <div
                key={j._id}
                className="dashGrid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "110px 2fr 1.6fr 1.2fr 1fr 1fr",
                  gap: 12,
                  padding: 14,
                  marginTop: 10,
                  borderRadius: 18,
                  border: `1px solid ${C.border}`,
                  background: "#fff",
                  alignItems: "center",
                  boxShadow: "0 10px 24px rgba(36,36,36,0.04)",
                  transition: "all .15s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(-1px)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow =
                    "0 14px 34px rgba(36,36,36,0.06)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(0px)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow =
                    "0 10px 24px rgba(36,36,36,0.04)";
                }}
              >
                <div style={{ fontWeight: 900, color: C.muted }}>{j._id.slice(-6)}</div>
                <div style={{ fontWeight: 900, color: C.text }}>{j.title}</div>
                <div style={{ fontWeight: 800, color: C.text }}>{companyLabel(j.company)}</div>
                <div style={{ fontWeight: 800, color: C.muted }}>{j.location || "—"}</div>

                <div>
                  <span style={pillStyle(j.status)}>
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 999,
                        background: (j.status ?? "active") === "active" ? C.success : C.warning,
                        display: "inline-block",
                      }}
                    />
                    {(j.status ?? "active") === "active" ? "Active" : "Paused"}
                  </span>
                </div>

                <div style={{ fontWeight: 800, color: C.muted }}>
                  {j.createdAt ? new Date(j.createdAt).toLocaleDateString() : "—"}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Responsive helper */}
      <style>{`
        @media (max-width: 980px) {
          .dashGrid {
            grid-template-columns: 100px 1.8fr 1.3fr 1fr 1fr 1fr !important;
          }
        }
        @media (max-width: 760px) {
          .dashGrid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}