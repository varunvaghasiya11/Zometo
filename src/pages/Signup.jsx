import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { registerPartner } from '../store/slices/authSlice';
import toast from 'react-hot-toast';

export default function Signup() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: ''
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const { loading } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('email', form.email);
    formData.append('password', form.password);
    formData.append('phone', form.phone);
    formData.append('address', form.address);
    if (image) {
      formData.append('image', image);
    }

    const resultAction = await dispatch(registerPartner(formData));
    
    if (registerPartner.fulfilled.match(resultAction)) {
      toast.success('Registration successful!');
      navigate('/login');
    } else {
      toast.error(resultAction.payload || 'Registration failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 520 }}>
        <div className="auth-header">
          <div className="auth-logo">🌟</div>
          <h1>Partner with Zomato</h1>
          <p>Join India's largest food delivery platform</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Restaurant Display Name</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Spice Garden"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                className="input-field"
                placeholder="partner@restaurant.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Contact Phone</label>
              <input
                type="tel"
                className="input-field"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Restaurant Address</label>
            <textarea
              className="input-field"
              placeholder="Full address of the restaurant"
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Create Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="Min 6 characters"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Restaurant Logo / Photo</label>
            <div className="image-upload-wrapper" onClick={() => document.getElementById('image-upload').click()}>
              {preview ? (
                <img src={preview} alt="Preview" className="preview-thumb" />
              ) : (
                <div className="upload-icon-box">
                  <ImageIcon size={20} color="var(--muted)" />
                </div>
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', color: image ? '#fff' : '#888', fontWeight: 500 }}>
                  {image ? image.name : 'Click to upload restaurant image'}
                </div>
                {!image && <div style={{ fontSize: '11px', color: '#666' }}>Max size 5MB, PNG or JPG</div>}
              </div>
              {image && <CheckCircle2 size={18} color="#22c55e" />}
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageChange}
              />
            </div>
          </div>

          <button type="submit" className="btn auth-btn" disabled={loading}>
            {loading ? 'Creating Account...' : <><UserPlus size={18} /> Apply for Partnership</>}
          </button>
        </form>

        <div className="auth-footer">
          Already a partner? 
          <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
