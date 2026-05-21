import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Search, Plus, Trash2, X, ToggleLeft, ToggleRight, Image as ImageIcon, CheckCircle2, Loader2, Edit2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  addfooditem, 
  getFoodItems, 
  updateFoodItem, 
  deleteFoodItem 
} from '../store/slices/authSlice';

export default function Menu() {
  const dispatch = useDispatch();
  const { user, foods: items } = useSelector(state => state.auth);
  
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [editingItem, setEditingItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [form, setForm] = useState({ title: '', price: '', category: 'Starter', description: '' });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const categories = ['All', 'Starter', 'Main Course', 'Dessert', 'Beverages', 'Snacks', 'Other'];

  const fetchItems = async () => {
    setLoading(true);
    try {
      await dispatch(getFoodItems()).unwrap();
    } catch (error) {
      console.error('Error fetching foods:', error);
      toast.error(error || 'Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setForm({ title: '', price: '', category: 'Starter', description: '' });
    setImage(null);
    setPreview(null);
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setForm({
      title: item.title || item.name || '',
      price: item.price || '',
      category: item.category || 'Starter',
      description: item.description || ''
    });
    setPreview(getImageUrl(item.image));
    setImage(null);
    setShowModal(true);
  };

  const handleAdd = async () => {
    setSubmitting(true);
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('price', parseFloat(form.price));
    formData.append('category', form.category);
    formData.append('description', form.description);
    if (image) {
      formData.append('image', image);
    }

    try {
      await dispatch(addfooditem(formData)).unwrap();
      toast.success('Food item added successfully!');
      setShowModal(false);
      fetchItems();
    } catch (error) {
      console.error('Error adding food item:', error);
      toast.error(error || 'Failed to add food item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    setSubmitting(true);
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('price', parseFloat(form.price));
    formData.append('category', form.category);
    formData.append('description', form.description);
    if (image) {
      formData.append('image', image);
    }

    try {
      const itemId = editingItem._id || editingItem.id;
      await dispatch(updateFoodItem({ id: itemId, data: formData })).unwrap();
      toast.success('Food item updated successfully!');
      setShowModal(false);
      fetchItems();
    } catch (error) {
      console.error('Error updating food item:', error);
      toast.error(error || 'Failed to update food item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.description) {
      toast.error('Please fill out all required fields');
      return;
    }
    if (parseFloat(form.price) < 0) {
      toast.error('Price must be greater than or equal to 0');
      return;
    }

    if (editingItem) {
      handleUpdate();
    } else {
      handleAdd();
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('blob:')) {
      return imagePath;
    }
    return `https://zomato-clone-api-5e4m.onrender.com${imagePath}`;
  };

  const toggle = async (id) => {
    try {
      const item = items.find(i => i._id === id || i.id === id);
      if (!item) return;
      
      const updatedAvailable = item.isAvailable === false ? false : true;
      const nextAvailable = !updatedAvailable;
      const itemId = item._id || item.id;
      
      const formData = new FormData();
      formData.append('isAvailable', nextAvailable);
      
      await dispatch(updateFoodItem({ id: itemId, data: formData })).unwrap();
      toast.success(`Item marked as ${nextAvailable ? 'available' : 'unavailable'}`);
      fetchItems();
    } catch (error) {
      console.error('Error toggling availability:', error);
      toast.error(error || 'Failed to update availability on server');
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setSubmitting(true);
    const itemId = itemToDelete._id || itemToDelete.id;
    try {
      await dispatch(deleteFoodItem(itemId)).unwrap();
      toast.success('Food item deleted successfully');
      setItemToDelete(null);
      fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error(error || 'Failed to delete item');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = (items || []).filter(i => {
    const itemTitle = i.title || i.name || '';
    const itemCategory = i.category || '';
    return (filter === 'All' || itemCategory.toLowerCase() === filter.toLowerCase()) &&
      itemTitle.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <h2>Menu Management</h2>
          <p>{loading ? 'Loading…' : `${filtered.length} items`}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div className="search-bar">
            <Search size={14} color="var(--muted)" />
            <input placeholder="Search items…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={14} /> Add Item
          </button>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 20 }}>
        {categories.map(c => (
          <button key={c} className={`tab-btn ${filter === c ? 'active' : ''}`} onClick={() => setFilter(c)}>{c}</button>
        ))}
      </div>

      <div className="card">
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0', gap: '16px' }}>
            <Loader2 className="spin" size={36} color="var(--red)" />
            <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Loading menu items…</p>
          </div>
        ) : (
          <>
            {filtered.map(item => {
              const itemId = item._id || item.id;
              const isAvailable = item.isAvailable !== false;
              
              return (
                <div key={itemId} className="menu-item">
                  <div className="menu-emoji" style={{ overflow: 'hidden', padding: 0 }}>
                    {item.image ? (
                      <img 
                        src={getImageUrl(item.image)} 
                        alt={item.title || item.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    ) : (
                      item.emoji || '🍽️'
                    )}
                  </div>
                  <div className="menu-info">
                    <div className="menu-name">{item.title || item.name}</div>
                    <div className="menu-cat" style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px' }}>
                      <span>{item.category}</span>
                      {item.description && <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{item.description}</span>}
                    </div>
                  </div>
                  <span className={`badge ${isAvailable ? 'badge-green' : 'badge-red'}`} style={{ marginRight: 12 }}>
                    {isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                  <span className="menu-price" style={{ marginRight: 16 }}>₹{item.price}</span>
                  
                  {}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button className="btn btn-icon btn-ghost" onClick={() => handleOpenEdit(item)} title="Edit item">
                      <Edit2 size={13} color="var(--text)" />
                    </button>
                    <button className="btn btn-icon btn-ghost" onClick={() => toggle(itemId)} title="Toggle availability">
                      {isAvailable ? <ToggleRight size={18} color="var(--green)" /> : <ToggleLeft size={18} color="var(--muted)" />}
                    </button>
                    <button className="btn btn-icon btn-ghost" onClick={() => setItemToDelete(item)} title="Remove">
                      <Trash2 size={14} color="var(--red)" />
                    </button>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '36px 24px' }}>No items found</p>
            )}
          </>
        )}
      </div>

      {}
      {showModal && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ width: 440, maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="card-header">
              <h3>{editingItem ? 'Edit Menu Item' : 'Add Menu Item'}</h3>
              <button className="btn btn-icon btn-ghost" onClick={() => setShowModal(false)} disabled={submitting}>
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="auth-form" style={{ gap: '16px', marginTop: '8px' }}>
              <div className="form-group">
                <label>Item Name / Title *</label>
                <input 
                  className="input-field" 
                  placeholder="e.g. Butter Chicken" 
                  value={form.title} 
                  onChange={e => setForm({ ...form, title: e.target.value })} 
                  required 
                  disabled={submitting}
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    className="input-field" 
                    placeholder="250" 
                    value={form.price} 
                    onChange={e => setForm({ ...form, price: e.target.value })} 
                    required 
                    disabled={submitting}
                  />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <select 
                    className="input-field" 
                    value={form.category} 
                    onChange={e => setForm({ ...form, category: e.target.value })} 
                    required
                    disabled={submitting}
                  >
                    <option value="Starter">Starter</option>
                    <option value="Main Course">Main Course</option>
                    <option value="Dessert">Dessert</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Short Description *</label>
                <textarea 
                  className="input-field" 
                  style={{ height: '70px', resize: 'vertical' }}
                  placeholder="Describe this delicious dish..." 
                  value={form.description} 
                  onChange={e => setForm({ ...form, description: e.target.value })} 
                  required 
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label>Food Photo (Optional)</label>
                <div 
                  className="image-upload-wrapper" 
                  onClick={() => !submitting && document.getElementById('food-image-upload').click()}
                  style={{ cursor: submitting ? 'not-allowed' : 'pointer' }}
                >
                  {preview ? (
                    <img src={preview} alt="Food Preview" className="preview-thumb" />
                  ) : (
                    <div className="upload-icon-box">
                      <ImageIcon size={20} color="var(--muted)" />
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', color: image ? '#fff' : '#888', fontWeight: 500 }}>
                      {image ? image.name : (editingItem ? 'Click to change photo' : 'Click to upload dish photo')}
                    </div>
                    {!image && <div style={{ fontSize: '11px', color: '#666' }}>Max size 5MB, PNG or JPG</div>}
                  </div>
                  {image && <CheckCircle2 size={18} color="#22c55e" />}
                  <input
                    id="food-image-upload"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleImageChange}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: '8px' }}>
                <button 
                  type="button" 
                  className="btn btn-ghost" 
                  style={{ flex: 1 }} 
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ flex: 1 }} 
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="spin" size={16} style={{ marginRight: 6 }} /> Saving…
                    </>
                  ) : (
                    editingItem ? 'Save Changes' : 'Add Item'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {}
      {itemToDelete && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110, backdropFilter: 'blur(4px)' }}>
          <div className="card fade-in" style={{ width: 380, border: '1px solid rgba(226, 55, 68, 0.2)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)' }}>
            <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ background: 'rgba(226,55,68,0.1)', color: 'var(--red)', width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <AlertTriangle size={18} />
              </div>
              <h3 style={{ fontSize: 16 }}>Delete Menu Item</h3>
            </div>
            
            <div style={{ padding: '20px', color: 'var(--text)' }}>
              <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--muted)', margin: 0 }}>
                Are you sure you want to delete <strong style={{ color: '#fff' }}>{itemToDelete.title || itemToDelete.name}</strong>? This action is permanent and will remove the item completely from your kitchen menu list.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10, padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
              <button 
                className="btn btn-ghost" 
                style={{ flex: 1 }} 
                onClick={() => setItemToDelete(null)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                style={{ flex: 1, background: 'var(--red)', borderColor: 'var(--red)' }} 
                onClick={handleConfirmDelete}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="spin" size={14} style={{ marginRight: 6 }} /> Deleting…
                  </>
                ) : (
                  'Delete Item'
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
