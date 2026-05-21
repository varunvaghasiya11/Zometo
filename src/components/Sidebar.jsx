import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, BookOpen, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSelector } from 'react-redux';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/orders', icon: ShoppingBag, label: 'Orders' },
  { path: '/menu', icon: BookOpen, label: 'Menu' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const user = useSelector(state => state.auth.user);

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:image/') || imagePath.startsWith('blob:')) {
      return imagePath;
    }
    return `https://zomato-clone-api-5e4m.onrender.com${imagePath}`;
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-logo">
        <div className="logo-icon">🍽️</div>
        {!collapsed && (
          <div className="logo-text">
            <span>Zomato</span> Partner<br />
            <span style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 400 }}>REST API Dashboard</span>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            title={collapsed ? label : ''}
          >
            <Icon size={18} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: collapsed ? '8px 0' : '10px 12px', marginBottom: 8, borderRadius: 10, background: 'var(--bg3)', border: '1px solid var(--border)', overflow: 'hidden' }}>
            {user.image ? (
              <img
                src={getImageUrl(user.image)}
                alt={user.name}
                style={{ width: collapsed ? 28 : 34, height: collapsed ? 28 : 34, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(226,55,68,0.4)', flexShrink: 0 }}
              />
            ) : (
              <div className="avatar" style={{ width: collapsed ? 28 : 34, height: collapsed ? 28 : 34, fontSize: collapsed ? 11 : 13, flexShrink: 0 }}>
                {getInitials(user.name)}
              </div>
            )}
            {!collapsed && (
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name || 'Partner'}</div>
                <div style={{ fontSize: 10, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email || ''}</div>
              </div>
            )}
          </div>
        )}
        <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)} title="Toggle sidebar">
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
}
