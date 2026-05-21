import { useLocation, useNavigate } from 'react-router-dom';
import { Key, LogOut } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import toast from 'react-hot-toast';

const titles = {
  '/': { title: 'Dashboard', sub: 'Overview of your partner performance' },
  '/orders': { title: 'Orders', sub: 'Track and manage live orders' },
  '/menu': { title: 'Menu Management', sub: 'Configure items, pricing and availability' },
  '/profile': { title: 'Profile', sub: 'Manage your restaurant details' },
};

export default function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  
  const info = titles[pathname] || titles['/'];

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.split(' ');
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
    <header className="header">
      <div className="header-left">
        <h1>{info.title}</h1>
        <p>{info.sub}</p>
      </div>
      <div className="header-right">
        <div className="header-badge">
          <span className="dot" />
          API Live
        </div>
        <div className="header-badge">
          <Key size={12} />
          v1.0
        </div>
        {user?.image ? (
          <img
            src={getImageUrl(user.image)}
            alt={user?.name}
            title={user?.name}
            style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(226,55,68,0.4)', flexShrink: 0 }}
          />
        ) : (
          <div className="avatar" title={user?.name}>{getInitials(user?.name)}</div>
        )}
        <button className="btn btn-icon btn-ghost" onClick={handleLogout} title="Logout" style={{ color: 'var(--red)' }}>
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
