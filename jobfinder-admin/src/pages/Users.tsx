import { useEffect, useMemo, useState } from "react";
import { http } from "../api/http";

type UserRow = {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role?: "admin" | "user" | string;
  blocked?: boolean;
  status?: "Active" | "Blocked";
  createdAt?: string;
};

const API_BASE = "/users";

function authHeader() {
  const token = localStorage.getItem("admin_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getId(u: UserRow) {
  return String(u._id ?? u.id ?? "");
}

function isBlocked(u: UserRow) {
  if (typeof u.blocked === "boolean") return u.blocked;
  return u.status === "Blocked";
}

function isAdmin(u: UserRow) {
  return (u.role ?? "user") === "admin";
}

export default function Users() {
  const C = {
    bg: "#FFFFFF",
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
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");

  // modal
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // form
  const [name, setName] = useState("New User");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("user12345");
  const [role, setRole] = useState<"user" | "admin">("user");

  const counts = useMemo(() => {
    const total = rows.length;
    const admins = rows.filter((u) => isAdmin(u)).length;
    const users = rows.filter((u) => !isAdmin(u)).length;
    const blocked = rows.filter((u) => isBlocked(u)).length;
    return { total, admins, users, blocked };
  }, [rows]);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();

    let list = rows;
    if (roleFilter !== "all") {
      list = list.filter((u) => (u.role ?? "user") === roleFilter);
    }
    if (!t) return list;

    return list.filter((u) =>
      `${u.name} ${u.email} ${u.role ?? ""}`.toLowerCase().includes(t),
    );
  }, [q, rows, roleFilter]);

  async function fetchUsers() {
    setErr("");
    setLoading(true);
    try {
      const res = await http.get(API_BASE, { headers: authHeader() });
      const list: UserRow[] = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.users)
          ? res.data.users
          : [];
      setRows(list);
    } catch (e: any) {
      setErr(e?.response?.data?.message || e.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  async function createUser() {
    if (!name.trim()) return setErr("Name is required");
    if (!email.trim()) return setErr("Email is required");
    if (password.length < 6)
      return setErr("Password must be at least 6 characters");

    setSaving(true);
    setErr("");

    try {
      await http.post(
        API_BASE,
        { name: name.trim(), email: email.trim(), password, role },
        { headers: authHeader() },
      );

      setOpen(false);
      setName("New User");
      setEmail("");
      setPassword("user12345");
      setRole("user");

      await fetchUsers();
    } catch (e: any) {
      setErr(e?.response?.data?.message || e.message || "Create user failed");
    } finally {
      setSaving(false);
    }
  }

  async function toggleBlock(userId: string, nextBlocked: boolean) {
    try {
      await http.patch(
        `${API_BASE}/${userId}/status`,
        { blocked: nextBlocked },
        { headers: authHeader() },
      );

      setRows((p) =>
        p.map((u) =>
          getId(u) === userId
            ? {
                ...u,
                blocked: nextBlocked,
                status: nextBlocked ? "Blocked" : "Active",
              }
            : u,
        ),
      );
    } catch (e: any) {
      setErr(e?.response?.data?.message || e.message || "Update failed");
    }
  }

  async function deleteUser(userId: string) {
    if (!confirm("Delete this user?")) return;
    try {
      await http.delete(`${API_BASE}/${userId}`, { headers: authHeader() });
      setRows((p) => p.filter((u) => getId(u) !== userId));
    } catch (e: any) {
      setErr(e?.response?.data?.message || e.message || "Delete failed");
    }
  }

  const chip = (active: boolean) =>
    ({
      height: 40,
      padding: "0 14px",
      borderRadius: 999,
      border: `1px solid ${active ? "rgba(91,130,249,0.28)" : C.border}`,
      background: active ? C.primarySoft : "#fff",
      color: active ? C.primary : C.muted,
      fontWeight: 900,
      cursor: "pointer",
      whiteSpace: "nowrap",
      transition: "all .15s ease",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
    }) as const;

  const rolePill = (r?: UserRow["role"]) => {
    const admin = (r ?? "user") === "admin";
    return {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "7px 12px",
      borderRadius: 999,
      fontWeight: 900,
      fontSize: 12,
      border: `1px solid ${
        admin ? "rgba(255,213,66,0.42)" : "rgba(91,130,249,0.25)"
      }`,
      background: admin ? "rgba(255,213,66,0.16)" : "rgba(91,130,249,0.10)",
      color: admin ? "#8A6A00" : C.primary,
      textTransform: "lowercase" as const,
      whiteSpace: "nowrap" as const,
    };
  };

  const statusPill = (blocked: boolean) =>
    ({
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "7px 12px",
      borderRadius: 999,
      fontWeight: 900,
      fontSize: 12,
      border: `1px solid ${
        blocked ? "rgba(255,213,66,0.35)" : "rgba(34,197,94,0.25)"
      }`,
      background: blocked ? "rgba(255,213,66,0.15)" : "rgba(34,197,94,0.10)",
      color: blocked ? "#8A6A00" : C.success,
      whiteSpace: "nowrap",
    }) as const;

  const input = {
    height: 46,
    borderRadius: 16,
    border: `1px solid ${C.border}`,
    padding: "0 14px",
    fontWeight: 800,
    background: C.surface,
    outline: "none",
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
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 14,
          flexWrap: "wrap",
        }}
      >
        <div style={{ minWidth: 260 }}>
          <h2 style={{ margin: 0, fontWeight: 900, letterSpacing: "-0.02em" }}>
            Users
          </h2>
          <div style={{ color: C.muted, fontWeight: 800, fontSize: 13 }}>
            Manage platform users and admin roles
          </div>

          {/* counts */}
          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 10,
              flexWrap: "wrap",
            }}
          >
            <span style={chip(false)}>Total: {counts.total}</span>
            <span style={chip(true)}>Admins: {counts.admins}</span>
            <span style={chip(true)}>Users: {counts.users}</span>
            <span style={chip(false)}>Blocked: {counts.blocked}</span>
          </div>
        </div>

        <button onClick={() => setOpen(true)} style={btn("primary")}>
          + Add User
        </button>
      </div>

      {/* Error */}
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

      {/* Main Card */}
      <div
        style={{
          borderRadius: 22,
          border: `1px solid ${C.border}`,
          padding: 18,
          background: C.bg,
          boxShadow: "0 14px 40px rgba(36,36,36,0.05)",
        }}
      >
        {/* Search + Tabs */}
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
            placeholder="Search users..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ ...input, flex: 1, minWidth: 240 }}
          />

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              style={chip(roleFilter === "all")}
              onClick={() => setRoleFilter("all")}
            >
              All
            </button>
            <button
              style={chip(roleFilter === "admin")}
              onClick={() => setRoleFilter("admin")}
            >
              Admins
            </button>
            <button
              style={chip(roleFilter === "user")}
              onClick={() => setRoleFilter("user")}
            >
              Users
            </button>
          </div>

          <button onClick={fetchUsers} disabled={loading} style={btn("plain")}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Table */}
        <div style={{ marginTop: 14 }}>
          {/* Header row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "110px 1.6fr 2fr 140px 140px 260px",
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
            <div>Name</div>
            <div>Email</div>
            <div>Role</div>
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
              Loading users...
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
              No users found.
            </div>
          ) : (
            filtered.map((u) => {
              const id = getId(u);
              const blocked = isBlocked(u);

              return (
                <div
                  key={id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "110px 1.6fr 2fr 140px 140px 260px",
                    gap: 12,
                    padding: 14,
                    marginTop: 10,
                    borderRadius: 18,
                    border: `1px solid ${C.border}`,
                    alignItems: "center",
                    background: "#fff",
                    boxShadow: "0 10px 24px rgba(36,36,36,0.04)",
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
                    {id.slice(-6)}
                  </div>

                  <div style={{ fontWeight: 900, color: C.text }}>{u.name}</div>

                  <div
                    style={{
                      fontWeight: 800,
                      color: C.muted,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {u.email}
                  </div>

                  <div>
                    <span style={rolePill(u.role)}>{u.role ?? "user"}</span>
                  </div>

                  <div>
                    <span style={statusPill(blocked)}>
                      {blocked ? "Blocked" : "Active"}
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
                    <button
                      onClick={() => toggleBlock(id, !blocked)}
                      style={btn("soft")}
                    >
                      {blocked ? "Unblock" : "Block"}
                    </button>
                    <button
                      onClick={() => deleteUser(id)}
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
            {/* Modal header */}
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
                  Add User
                </div>
                <div
                  style={{
                    marginTop: 4,
                    fontWeight: 800,
                    color: C.muted,
                    fontSize: 13,
                  }}
                >
                  Create a user/admin that can login in mobile app
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
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal body */}
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
                  Name
                </div>
                <input
                  style={{ ...input, background: "#fff" }}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                  Email
                </div>
                <input
                  style={{ ...input, background: "#fff" }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                    Password
                  </div>
                  <input
                    type="password"
                    style={{ ...input, background: "#fff" }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                    Role
                  </div>
                  <select
                    style={{ ...input, background: "#fff" }}
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Modal footer */}
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
              <button
                onClick={createUser}
                style={btn("primary")}
                disabled={saving}
              >
                {saving ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 980px) {
          .usersGridFix {
            grid-template-columns: 100px 1.2fr 1.6fr 120px 120px 1fr !important;
          }
        }
        @media (max-width: 760px) {
          .usersGridFix {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
