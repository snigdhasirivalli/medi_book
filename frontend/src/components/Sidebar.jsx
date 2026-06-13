import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiHome, FiSearch, FiCalendar, FiUser, FiUsers,
  FiGrid, FiLogOut, FiActivity, FiInfo
} from 'react-icons/fi';

const patientNav = [
  { path: '/dashboard', icon: <FiHome />, label: 'Dashboard' },
  { path: '/find-doctors', icon: <FiSearch />, label: 'Find Doctors' },
  { path: '/my-appointments', icon: <FiCalendar />, label: 'My Appointments' },
  { path: '/profile', icon: <FiUser />, label: 'My Profile' },
];

const doctorNav = [
  { path: '/doctor-dashboard', icon: <FiHome />, label: 'Dashboard' },
  { path: '/doctor-appointments', icon: <FiCalendar />, label: 'Appointments' },
  { path: '/profile', icon: <FiUser />, label: 'My Profile' },
];

const adminNav = [
  { path: '/admin', icon: <FiGrid />, label: 'Dashboard' },
  { path: '/admin/doctors', icon: <FiActivity />, label: 'Doctors' },
  { path: '/admin/users', icon: <FiUsers />, label: 'Users' },
  { path: '/admin/appointments', icon: <FiCalendar />, label: 'Appointments' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems =
    user?.role === 'admin' ? adminNav : user?.role === 'doctor' ? doctorNav : patientNav;

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">🏥</div>
        <div className="brand">Medi<span>Book</span></div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Menu</div>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="name">{user?.name}</div>
            <div className="role">{user?.role}</div>
          </div>
        </div>
        <button className="nav-item" style={{ width: '100%' }} onClick={handleLogout}>
          <span className="nav-icon"><FiLogOut /></span>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
