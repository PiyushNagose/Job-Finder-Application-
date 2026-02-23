import { useEffect, useMemo, useState } from "react";
import { http } from "../api/http";

type Company = {
  _id: string;
  name: string;
};

type Job = {
  _id: string;
  title: string;
  company?: string | Company;
  location?: string;
  status?: "active" | "paused";
  createdAt?: string;
};

function companyLabel(c?: Job["company"]) {
  if (!c) return "—";
  if (typeof c === "string") return c;
  return c.name;
}

function companyIdOf(c?: Job["company"]) {
  if (!c) return "";
  if (typeof c === "string") return c;
  return c._id;
}

export default function Jobs() {
  const JOBS_ENDPOINT = "/jobs";
  const COMPANIES_ENDPOINT = "/companies";

  const C = {
    bg: "#FFFFFF",
    card: "#FFFFFF",
    surface: "#F6F6F6",
    text: "#242424",
    muted: "#797979",
    primary: "#5B82F9",
    primarySoft: "rgba(91,130,249,0.12)",
    border: "rgba(36,36,36,0.10)",
    divider: "rgba(36,36,36,0.06)",
    danger: "#EF4444",
    success: "#22C55E",
    warning: "#FFD542",
  };

  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // modal
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Job | null>(null);

  // form
  const [title, setTitle] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState<"active" | "paused">("active");
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const t = q.toLowerCase();
    return rows.filter((j) =>
      `${j.title} ${companyLabel(j.company)} ${j.location || ""}`
        .toLowerCase()
        .includes(t),
    );
  }, [q, rows]);

  async function fetchJobs() {
    setLoading(true);
    setErr("");
    try {
      const res = await http.get<Job[]>(JOBS_ENDPOINT);
      setRows(res.data || []);
    } catch (e: any) {
      setErr(e?.response?.data?.message || e.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }

  async function fetchCompanies() {
    try {
      const res = await http.get<Company[]>(COMPANIES_ENDPOINT);
      setCompanies(res.data || []);
    } catch (e: any) {
      setErr(
        (prev) =>
          prev ||
          e?.response?.data?.message ||
          e.message ||
          "Failed to load companies",
      );
    }
  }

  useEffect(() => {
    fetchJobs();
    fetchCompanies();
  }, []);

  function openCreate() {
    setErr("");
    setEditing(null);
    setTitle("");
    setCompanyId("");
    setLocation("");
    setStatus("active");
    setOpen(true);
  }

  function openEdit(job: Job) {
    setErr("");
    setEditing(job);
    setTitle(job.title);
    setCompanyId(companyIdOf(job.company));
    setLocation(job.location || "");
    setStatus(job.status || "active");
    setOpen(true);
  }

  async function submit() {
    if (!title.trim()) return setErr("Please enter job title");
    if (!companyId) return setErr("Please select a company");

    setSaving(true);
    setErr("");

    const payload = {
      title: title.trim(),
      company: companyId,
      location: location.trim(),
      status,
    };

    try {
      if (editing) {
        await http.put(`${JOBS_ENDPOINT}/${editing._id}`, payload);
      } else {
        await http.post(JOBS_ENDPOINT, payload);
      }
      setOpen(false);
      await fetchJobs();
    } catch (e: any) {
      setErr(e?.response?.data?.message || e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    const ok = confirm("Delete this job?");
    if (!ok) return;

    try {
      await http.delete(`${JOBS_ENDPOINT}/${id}`);
      setRows((prev) => prev.filter((j) => j._id !== id));
    } catch (e: any) {
      setErr(e?.response?.data?.message || e.message || "Delete failed");
    }
  }

  const statusPill = (s?: Job["status"]) => {
    const active = s === "active";
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

  const inputStyle = {
    width: "100%",
    height: 46,
    borderRadius: 16,
    border: `1px solid ${C.border}`,
    padding: "0 14px",
    fontWeight: 800,
    outline: "none",
    background: C.surface,
    color: C.text,
  } as const;

  const btn = (variant: "primary" | "soft" | "danger" | "plain") => {
    const base = {
      height: 42,
      borderRadius: 14,
      padding: "0 14px",
      fontWeight: 900,
      cursor: "pointer",
      transition: "all .15s ease",
      whiteSpace: "nowrap" as const,
    };

    if (variant === "primary")
      return {
        ...base,
        border: "none",
        background: C.primary,
        color: "#fff",
        boxShadow: "0 10px 24px rgba(91,130,249,0.25)",
      } as const;

    if (variant === "soft")
      return {
        ...base,
        border: `1px solid ${C.border}`,
        background: C.primarySoft,
        color: C.primary,
      } as const;

    if (variant === "danger")
      return {
        ...base,
        border: "1px solid rgba(239,68,68,0.25)",
        background: "rgba(239,68,68,0.10)",
        color: C.danger,
      } as const;

    return {
      ...base,
      border: `1px solid ${C.border}`,
      background: "#fff",
      color: C.text,
    } as const;
  };

  return (
    <div className="stack" style={{ gap: 18 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 14,
          flexWrap: "wrap",
        }}
      >
        <div style={{ minWidth: 280 }}>
          <h2
            style={{
              margin: 0,
              fontWeight: 900,
              letterSpacing: "-0.02em",
              fontSize: 24,
              color: C.text,
            }}
          >
            Jobs
          </h2>
          <div
            style={{
              marginTop: 4,
              color: C.muted,
              fontWeight: 800,
              fontSize: 13,
            }}
          >
            Manage jobs that show in the mobile app
          </div>
        </div>

        <button onClick={openCreate} style={btn("primary")}>
          + Add Job
        </button>
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

      {/* Card */}
      <div
        style={{
          borderRadius: 22,
          border: `1px solid ${C.border}`,
          background: C.card,
          padding: 18,
          boxShadow: "0 14px 40px rgba(36,36,36,0.05)",
        }}
      >
        {/* Search + Refresh */}
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          <input
            placeholder="Search jobs…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ ...inputStyle, flex: 1, minWidth: 240 }}
          />

          <button onClick={fetchJobs} style={btn("plain")} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Table */}
        <div style={{ marginTop: 14 }}>
          <div
            className="jobsGrid"
            style={{
              display: "grid",
              gridTemplateColumns: "110px 2fr 1.6fr 1.2fr 1fr 240px",
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
            <div style={{ textAlign: "right" }}>Actions</div>
          </div>

          {loading ? (
            <div
              style={{
                padding: 18,
                textAlign: "center",
                color: C.muted,
                fontWeight: 900,
              }}
            >
              Loading jobs…
            </div>
          ) : filtered.length === 0 ? (
            <div
              style={{
                padding: 18,
                textAlign: "center",
                color: C.muted,
                fontWeight: 900,
              }}
            >
              No jobs found.
            </div>
          ) : (
            filtered.map((j) => (
              <div
                key={j._id}
                className="jobsGrid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "110px 2fr 1.6fr 1.2fr 1fr 240px",
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
                  (e.currentTarget as HTMLDivElement).style.transform =
                    "translateY(-1px)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow =
                    "0 14px 34px rgba(36,36,36,0.06)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform =
                    "translateY(0px)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow =
                    "0 10px 24px rgba(36,36,36,0.04)";
                }}
              >
                <div style={{ fontWeight: 900, color: C.muted }}>
                  {j._id.slice(-6)}
                </div>

                <div style={{ fontWeight: 900, color: C.text, minWidth: 0 }}>
                  {j.title}
                </div>

                <div style={{ fontWeight: 800, color: C.text }}>
                  {companyLabel(j.company)}
                </div>

                <div style={{ fontWeight: 800, color: C.muted }}>
                  {j.location || "—"}
                </div>

                <div>
                  <span style={statusPill(j.status)}>
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 999,
                        background:
                          j.status === "active" ? C.success : C.warning,
                        display: "inline-block",
                      }}
                    />
                    {j.status === "active" ? "Active" : "Paused"}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <button onClick={() => openEdit(j)} style={btn("soft")}>
                    Edit
                  </button>
                  <button onClick={() => remove(j._id)} style={btn("danger")}>
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(36,36,36,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            zIndex: 80,
          }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !saving) setOpen(false);
          }}
        >
          <div
            style={{
              width: "min(560px, 96vw)",
              borderRadius: 24,
              background: "#fff",
              border: `1px solid ${C.border}`,
              boxShadow: "0 18px 70px rgba(0,0,0,0.25)",
              overflow: "hidden",
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Head */}
            <div
              style={{
                padding: 18,
                background: C.surface,
                borderBottom: `1px solid ${C.divider}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontWeight: 900, fontSize: 18, color: C.text }}>
                  {editing ? "Edit Job" : "Add Job"}
                </div>
                <div
                  style={{
                    marginTop: 4,
                    fontWeight: 800,
                    fontSize: 13,
                    color: C.muted,
                  }}
                >
                  Fill details and save to update mobile app listing
                </div>
              </div>

              <button
                onClick={() => !saving && setOpen(false)}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 14,
                  border: `1px solid ${C.border}`,
                  background: "#fff",
                  cursor: "pointer",
                  fontWeight: 900,
                  opacity: saving ? 0.6 : 1,
                }}
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: 18, display: "grid", gap: 12 }}>
              <div>
                <div
                  style={{
                    fontWeight: 900,
                    color: C.muted,
                    fontSize: 12,
                    marginBottom: 6,
                  }}
                >
                  Job Title
                </div>
                <input
                  style={{ ...inputStyle, background: "#fff" }}
                  placeholder="Job Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <div
                  style={{
                    fontWeight: 900,
                    color: C.muted,
                    fontSize: 12,
                    marginBottom: 6,
                  }}
                >
                  Company
                </div>
                <select
                  style={{ ...inputStyle, background: "#fff" }}
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                >
                  <option value="">Select company</option>
                  {companies.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 900,
                      color: C.muted,
                      fontSize: 12,
                      marginBottom: 6,
                    }}
                  >
                    Location
                  </div>
                  <input
                    style={{ ...inputStyle, background: "#fff" }}
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                <div>
                  <div
                    style={{
                      fontWeight: 900,
                      color: C.muted,
                      fontSize: 12,
                      marginBottom: 6,
                    }}
                  >
                    Status
                  </div>
                  <select
                    style={{ ...inputStyle, background: "#fff" }}
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as "active" | "paused")
                    }
                  >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                padding: 18,
                borderTop: `1px solid ${C.divider}`,
                display: "flex",
                justifyContent: "flex-end",
                gap: 12,
              }}
            >
              <button onClick={() => setOpen(false)} style={btn("plain")}>
                Cancel
              </button>

              <button onClick={submit} disabled={saving} style={btn("primary")}>
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Responsive helper */}
      <style>{`
        @media (max-width: 980px) {
          .jobsGrid {
            grid-template-columns: 100px 1.8fr 1.3fr 1fr 1fr 1fr !important;
          }
        }
        @media (max-width: 760px) {
          .jobsGrid {
            grid-template-columns: 1fr !important;
          }
          .jobsGrid > div:last-child {
            justify-content: flex-start !important;
          }
        }
      `}</style>
    </div>
  );
}
