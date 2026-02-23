import { useEffect, useMemo, useState } from "react";
import { http } from "../api/http";

type Company = {
  _id?: string;
  id?: string;
  name: string;
  industry?: string;
  city?: string;
  website?: string;
  jobsCount?: number;
  createdAt?: string;
};

const API_BASE = "/companies";

function getId(c: Company) {
  return String(c._id ?? c.id ?? "");
}

function authHeader() {
  const token = localStorage.getItem("admin_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function Companies() {
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
  const [rows, setRows] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // modal
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);

  // form
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [city, setCity] = useState("");
  const [website, setWebsite] = useState("");

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return rows;
    return rows.filter((c) =>
      `${c.name} ${c.industry ?? ""} ${c.city ?? ""} ${c.website ?? ""}`
        .toLowerCase()
        .includes(t),
    );
  }, [q, rows]);

  async function fetchCompanies() {
    setErr("");
    setLoading(true);
    try {
      const res = await http.get(API_BASE, { headers: authHeader() });

      const list: Company[] = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.companies)
          ? res.data.companies
          : Array.isArray(res.data?.items)
            ? res.data.items
            : [];

      setRows(list);
    } catch (e: any) {
      setErr(
        e?.response?.data?.message || e.message || "Failed to load companies",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCompanies();
  }, []);

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

  function resetForm() {
    setName("");
    setIndustry("");
    setCity("");
    setWebsite("");
  }

  function openCreate() {
    setErr("");
    setEditing(null);
    resetForm();
    setOpen(true);
  }

  function openEdit(c: Company) {
    setErr("");
    setEditing(c);
    setName(c.name ?? "");
    setIndustry(c.industry ?? "");
    setCity(c.city ?? "");
    setWebsite(c.website ?? "");
    setOpen(true);
  }

  async function submit() {
    if (!name.trim()) {
      setErr("Company name is required");
      return;
    }

    setErr("");
    setSaving(true);

    const payload = {
      name: name.trim(),
      industry: industry.trim(),
      city: city.trim(),
      website: website.trim(),
    };

    try {
      if (editing) {
        const id = getId(editing);
        await http.put(`${API_BASE}/${id}`, payload, { headers: authHeader() });
      } else {
        await http.post(API_BASE, payload, { headers: authHeader() });
      }

      setOpen(false);
      setEditing(null);
      resetForm();
      await fetchCompanies();
    } catch (e: any) {
      setErr(
        e?.response?.data?.message ||
          e.message ||
          (editing ? "Update company failed" : "Create company failed"),
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteCompany(companyId: string) {
    const ok = confirm("Delete this company?");
    if (!ok) return;

    setErr("");
    try {
      await http.delete(`${API_BASE}/${companyId}`, { headers: authHeader() });
      setRows((p) => p.filter((c) => getId(c) !== companyId));
    } catch (e: any) {
      setErr(e?.response?.data?.message || e.message || "Delete failed");
    }
  }

  const jobsPill = () =>
    ({
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "8px 12px",
      borderRadius: 999,
      fontWeight: 900,
      fontSize: 12,
      border: `1px solid rgba(91,130,249,0.25)`,
      background: C.primarySoft,
      color: C.primary,
      whiteSpace: "nowrap",
    }) as const;

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
            Companies
          </h2>
          <div
            style={{
              marginTop: 4,
              color: C.muted,
              fontWeight: 800,
              fontSize: 13,
            }}
          >
            Manage companies used across the mobile app
          </div>
        </div>

        <button onClick={openCreate} style={btn("primary")}>
          + Add Company
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
        {/* Search + Actions */}
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
            placeholder="Search companies…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{
              ...inputStyle,
              flex: 1,
              minWidth: 240,
              background: C.surface,
            }}
          />

          <button
            onClick={fetchCompanies}
            disabled={loading}
            style={btn("plain")}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Table */}
        <div style={{ marginTop: 14 }}>
          {/* Header row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "110px 2fr 1.4fr 1fr 120px 260px",
              gap: 12,
              padding: "12px 12px",
              color: C.muted,
              fontWeight: 900,
              fontSize: 12,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              borderBottom: `1px solid ${C.divider}`,
            }}
            className="companiesGrid"
          >
            <div>ID</div>
            <div>Name</div>
            <div>Industry</div>
            <div>City</div>
            <div>Jobs</div>
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
              Loading companies…
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
              No companies found.
            </div>
          ) : (
            filtered.map((c) => {
              const id = getId(c);
              const url = (c.website ?? "").trim();

              return (
                <div
                  key={id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "110px 2fr 1.4fr 1fr 120px 260px",
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
                  className="companiesGrid"
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
                    {id ? id.slice(-6) : "—"}
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 900, color: C.text }}>
                      {c.name}
                    </div>
                    {url ? (
                      <div
                        style={{
                          marginTop: 4,
                          fontSize: 12,
                          fontWeight: 800,
                          color: C.muted,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={url}
                      >
                        {url}
                      </div>
                    ) : null}
                  </div>

                  <div style={{ fontWeight: 800, color: C.text }}>
                    {c.industry || "—"}
                  </div>
                  <div style={{ fontWeight: 800, color: C.muted }}>
                    {c.city || "—"}
                  </div>

                  <div>
                    <span style={jobsPill()}>{c.jobsCount ?? 0}</span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    <button onClick={() => openEdit(c)} style={btn("soft")}>
                      Edit
                    </button>

                    <button
                      onClick={() => deleteCompany(id)}
                      style={btn("danger")}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal */}
      {open ? (
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
            {/* Header */}
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
                  {editing ? "Edit Company" : "Add Company"}
                </div>
                <div
                  style={{
                    marginTop: 4,
                    fontWeight: 800,
                    fontSize: 13,
                    color: C.muted,
                  }}
                >
                  {editing
                    ? "Update company details for the mobile app"
                    : "Create a company in MongoDB"}
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
                  Company Name *
                </div>
                <input
                  style={{ ...inputStyle, background: "#fff" }}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. BrioSoft Solutions"
                />
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
                    Industry
                  </div>
                  <input
                    style={{ ...inputStyle, background: "#fff" }}
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="IT & Software"
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
                    City
                  </div>
                  <input
                    style={{ ...inputStyle, background: "#fff" }}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Mumbai"
                  />
                </div>
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
                  Website
                </div>
                <input
                  style={{ ...inputStyle, background: "#fff" }}
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.com"
                />
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
              <button
                onClick={() => !saving && setOpen(false)}
                style={btn("plain")}
                disabled={saving}
              >
                Cancel
              </button>

              <button onClick={submit} style={btn("primary")} disabled={saving}>
                {saving ? "Saving..." : editing ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Responsive helper */}
      <style>{`
        @media (max-width: 980px) {
          .companiesGrid {
            grid-template-columns: 100px 1.6fr 1.2fr 1fr 110px 1fr !important;
          }
        }
        @media (max-width: 760px) {
          .companiesGrid {
            grid-template-columns: 1fr !important;
          }
          .companiesGrid > div:last-child {
            justify-content: flex-start !important;
          }
        }
      `}</style>
    </div>
  );
}
