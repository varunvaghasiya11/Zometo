import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, ShieldCheck } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { loginPartner } from '../store/slices/authSlice';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const { loading } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const resultAction = await dispatch(loginPartner(form));

    if (loginPartner.fulfilled.match(resultAction)) {
      toast.success('Welcome back!');
      navigate('/');
    } else {
      toast.error(resultAction.payload || 'Invalid email or password');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">🚀</div>
          <h1>Welcome Back</h1>
          <p>Sign in to manage your restaurant orders and growth</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              className="input-field"
              placeholder="name@restaurant.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0 8px 4px' }}>
            <ShieldCheck size={14} color="#22c55e" />
            <span style={{ fontSize: '12px', color: '#888' }}>Secure encrypted login</span>
          </div>

          <button type="submit" className="btn auth-btn" disabled={loading}>
            {loading ? 'Signing in...' : <><LogIn size={18} /> Sign In to Dashboard</>}
          </button>
        </form>

        <div className="auth-footer">
          New to Zomato Partner?
          <Link to="/signup">Create an account</Link>
        </div>
      </div>
    </div>
  );
}
