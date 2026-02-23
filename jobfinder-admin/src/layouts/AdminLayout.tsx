import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { clearAdminSession, getAdminUser } from "../api/auth";
import {
  LayoutDashboard,
  Briefcase,
  Building2,
  Users,
  Settings,
  LogOut,
} from "lucide-react";

import logo from "../assets/logo.png";

function NavItem({
  to,
  label,
  Icon,
  end,
}: {
  to: string;
  label: string;
  Icon: any;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => `navItem ${isActive ? "active" : ""}`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </NavLink>
  );
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const user = getAdminUser();

  const logout = () => {
    clearAdminSession();
    navigate("/login", { replace: true });
  };

  return (
    <div className="adminShell">
      <style>{brandStyles}</style>

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brandLogo">
            <img src={logo} alt="Job Finder Logo" />
          </div>

          <div className="brandText">
            <div className="brandTitle">Job Finder</div>
            <div className="brandSub">Admin Dashboard</div>
          </div>
        </div>

        <nav className="nav">
          <NavItem to="/" end label="Dashboard" Icon={LayoutDashboard} />
          <NavItem to="/jobs" label="Jobs" Icon={Briefcase} />
          <NavItem to="/companies" label="Companies" Icon={Building2} />
          <NavItem to="/users" label="Users" Icon={Users} />
          <NavItem to="/settings" label="Settings" Icon={Settings} />
        </nav>

        <div className="sidebarFooter">
          <div className="adminMini">
            <div className="avatar">
              {(user?.name?.[0] ?? "A").toUpperCase()}
            </div>

            <div className="adminMeta">
              <div className="adminName">{user?.name ?? "Admin"}</div>
              <div className="adminEmail">
                {user?.email ?? "admin@email.com"}
              </div>
            </div>
          </div>

          <button className="btn danger full" onClick={logout}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main">
        <div className="content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

const brandStyles = `
.brand {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 22px 20px 18px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.brandLogo {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 6px 18px rgba(0,0,0,0.25);
  transition: all 0.25s ease;
}

.brandLogo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.brandLogo:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(0,0,0,0.35);
}

.brandText {
  display: flex;
  flex-direction: column;
}

.brandTitle {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.brandSub {
  font-size: 12px;
  opacity: 0.6;
}
`;
