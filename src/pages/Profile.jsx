import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Save, Camera, User, Trash2, X, Loader2 } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { deleteProfile, updateProfile } from '../store/slices/authSlice';
import toast from 'react-hot-toast';

export default function Profile() {
  const dispatch = useDispatch();
  const { user, loading } = useSelector(state => state.auth);

  const [selectedId, setSelectedId] = useState(null);
  const [localImage, setLocalImage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [profile, setProfile] = useState({ name: '', email: '', password: '', phone: '', address: '' });

  useEffect(() => {
    if (user) {
      setSelectedId(user._id);
      setProfile({
        name: user.name || '',
        email: user.email || '',
        password: '',
        phone: user.phone || '',
        address: user.address || ''
      });
      setLocalImage(user.image || '');
    }
  }, [user]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!profile.name || !profile.email || !profile.phone || !profile.address) {
      toast.error('Please fill out all required fields');
      return;
    }
    if (profile.password && profile.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setSubmitting(true);

    const payload = {
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      address: profile.address,
      ...(profile.password ? { password: profile.password } : {}),
      image: localImage
    };

    try {
      dispatch(updateProfile({
        _id: selectedId,
        ...payload
      }));
      toast.success('Restaurant profile updated successfully!');
      setShowModal(false);
    } catch (err) {
      console.error('Error saving profile:', err);
      toast.error('Failed to save profile changes');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProfile = () => {
    if (window.confirm('Are you sure you want to remove your restaurant profile? This action will permanently delete your account.')) {
      dispatch(deleteProfile(selectedId));
      toast.success('Restaurant profile removed');
      setShowModal(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size cannot exceed 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setLocalImage(base64String);
        toast.success('Restaurant logo selected!');
      };
      reader.readAsDataURL(file);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (
      imagePath.startsWith('http://') ||
      imagePath.startsWith('https://') ||
      imagePath.startsWith('data:image/') ||
      imagePath.startsWith('blob:')
    ) {
      return imagePath;
    }
    return `https://zomato-clone-api-5e4m.onrender.com${imagePath}`;
  };

  const getInitials = (nameStr = '') => {
    if (!nameStr) return '?';
    const parts = nameStr.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return nameStr.slice(0, 2).toUpperCase();
  };

  const displayImage = localImage || (user?.image ? getImageUrl(user.image) : null);

  return (
    <div className="page fade-in">
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <div className="profile-section profile-banner" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              {displayImage ? (
                <img
                  src={displayImage}
                  alt={user?.name}
                  style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(226,55,68,0.4)', boxShadow: '0 0 0 2px var(--bg2)' }}
                />
              ) : (
                <div className="avatar" style={{ width: 88, height: 88, fontSize: 30, boxShadow: '0 0 0 4px rgba(226,55,68,0.2)' }}>
                  {getInitials(user?.name) || <User size={32} />}
                </div>
              )}
            </div>
            <div>
              <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{user?.name || 'Unnamed Store'}</h3>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                <span className="badge badge-red">Active Kitchen</span>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ margin: 0 }}>Restaurant Details</h3>
            <button
              className="btn btn-ghost"
              onClick={() => {
                setProfile({
                  name: user?.name || '',
                  email: user?.email || '',
                  password: '',
                  phone: user?.phone || '',
                  address: user?.address || ''
                });
                setLocalImage(user?.image || '');
                setShowModal(true);
              }}
              style={{ padding: '0 16px', height: '36px', fontSize: '13px' }}
            >
              Edit Profile
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
              <span style={{ color: 'var(--muted)', fontSize: 13 }}>Name</span>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{user?.name || '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
              <span style={{ color: 'var(--muted)', fontSize: 13 }}>Email Address</span>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{user?.email || '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
              <span style={{ color: 'var(--muted)', fontSize: 13 }}>Contact Phone</span>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{user?.phone || '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 4 }}>
              <span style={{ color: 'var(--muted)', fontSize: 13 }}>Restaurant Address</span>
              <span style={{ fontWeight: 600, fontSize: 14, maxWidth: '60%', textAlign: 'right' }}>{user?.address || '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {showModal && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
          <div className="card fade-in" style={{ width: 480, maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="card-header">
              <h3>Edit Restaurant Profile</h3>
              <button className="btn btn-icon btn-ghost" onClick={() => setShowModal(false)} disabled={submitting}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} className="auth-form" style={{ gap: '16px', marginTop: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                <div style={{ position: 'relative' }}>
                  {localImage ? (
                    <img
                      src={getImageUrl(localImage)}
                      alt="Logo Preview"
                      style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(226,55,68,0.4)' }}
                    />
                  ) : (
                    <div className="avatar" style={{ width: 88, height: 88, fontSize: 30 }}>
                      {getInitials(profile.name)}
                    </div>
                  )}
                  <button
                    type="button"
                    className="btn btn-icon"
                    onClick={() => document.getElementById('modal-image-upload').click()}
                    style={{ position: 'absolute', bottom: -2, right: -2, background: 'var(--bg3)', border: '1px solid var(--border)', padding: 6 }}
                    title="Upload Restaurant Logo"
                    disabled={submitting}
                  >
                    <Camera size={13} color="var(--text)" />
                  </button>
                  <input
                    id="modal-image-upload"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleAvatarChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Restaurant Display Name *</label>
                <input name="name" className="input-field" placeholder="e.g. Spice Garden" value={profile.name} onChange={handleChange} required disabled={submitting} />
              </div>

              <div className="form-group">
                <label>Email Address *</label>
                <input name="email" type="email" className="input-field" placeholder="partner@zomato.com" value={profile.email} onChange={handleChange} required disabled={submitting} />
              </div>

              <div className="form-group">
                <label>Password (Min 6 characters — leave blank to keep current)</label>
                <input name="password" type="password" className="input-field" placeholder="••••••" value={profile.password} onChange={handleChange} disabled={submitting} />
              </div>

              <div className="form-group">
                <label>Contact Phone Number *</label>
                <input name="phone" className="input-field" placeholder="9876543210" value={profile.phone} onChange={handleChange} required disabled={submitting} />
              </div>

              <div className="form-group">
                <label>Restaurant Address *</label>
                <input name="address" className="input-field" placeholder="MG Road, Surat" value={profile.address} onChange={handleChange} required disabled={submitting} />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: '8px', borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ color: 'var(--red)', borderColor: 'rgba(226,55,68,0.2)', marginRight: 'auto', padding: '0 12px' }}
                  onClick={handleDeleteProfile}
                  disabled={submitting}
                >
                  <Trash2 size={13} style={{ marginRight: 4 }} /> Delete Account
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? (
                    <><Loader2 className="spin" size={16} style={{ marginRight: 6 }} /> Saving…</>
                  ) : (
                    <><Save size={14} style={{ marginRight: 6 }} /> Save Changes</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
