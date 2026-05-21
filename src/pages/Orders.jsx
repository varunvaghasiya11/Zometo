import { useState, useEffect } from 'react';
import { ChevronRight, Loader2, MapPin, Package, Clock, DollarSign } from 'lucide-react';
import api from '../api/api';
import toast from 'react-hot-toast';

const columns = [
  { key: 'pending', label: '⏳ Pending', color: '#3b82f6' },
  { key: 'confirmed', label: '✅ Confirmed', color: '#06b6d4' },
  { key: 'preparing', label: '🔥 Preparing', color: '#f59e0b' },
  { key: 'out_for_delivery', label: '🛵 Out for Delivery', color: '#a855f7' },
  { key: 'delivered', label: '🎉 Delivered', color: '#10b981' },
];

const next = { 
  pending: 'confirmed', 
  confirmed: 'preparing', 
  preparing: 'out_for_delivery', 
  out_for_delivery: 'delivered' 
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      const fetchedOrders = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setOrders(fetchedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders from server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const advance = async (id, currentStatus) => {
    const nextStatus = next[currentStatus];
    if (!nextStatus) return;

    setUpdatingId(id);
    try {
      await api.put(`/orders/${id}/status`, { status: nextStatus });
      toast.success(`Order status updated to ${nextStatus}!`);
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status: nextStatus } : o));
      fetchOrders();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <h2>Order Manager</h2>
          <p>{loading ? 'Loading pipeline…' : `${orders.length} total live orders`}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {columns.map(c => {
            const count = orders.filter(o => o.status === c.key).length;
            return (
              <span key={c.key} className="badge badge-blue" style={{ fontSize: 12, padding: '4px 10px', background: `${c.color}15`, color: c.color, border: `1px solid ${c.color}25` }}>
                {count} {c.label.split(' ')[1]}
              </span>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 0', gap: '16px' }}>
          <Loader2 className="spin" size={40} color="var(--red)" />
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Loading kitchen pipelines…</p>
        </div>
      ) : (
        <div className="kanban">
          {columns.map(col => {
            const colOrders = orders.filter(o => o.status === col.key);
            
            return (
              <div key={col.key} className="kanban-col">
                <div className="kanban-col-header" style={{ borderBottom: `2px solid ${col.color}` }}>
                  <h4 style={{ color: col.color, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {col.label}
                  </h4>
                  <span className="kanban-count" style={{ background: `${col.color}22`, color: col.color }}>{colOrders.length}</span>
                </div>

                <div className="kanban-cards">
                  {colOrders.map(o => {
                    const idText = (o._id || o.id || '').toUpperCase();
                    const cleanId = idText.length > 8 ? idText.slice(-6) : idText;
                    
                    
                    const itemsDesc = (o.items || [])
                      .map(item => `${item.food?.title || item.food?.name || 'Dish'} (x${item.quantity})`)
                      .join(', ');

                    return (
                      <div key={o._id || o.id} className="order-card fade-in">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                          <span style={{ fontWeight: 800, fontSize: 13, color: 'var(--text)' }}>#{cleanId}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--muted)' }}>
                            <Clock size={10} />
                            {o.createdAt ? new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 12 }}>
                          <Package size={14} color="var(--muted)" style={{ marginTop: 2, flexShrink: 0 }} />
                          <span style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.4 }}>
                            {itemsDesc || 'No items listed'}
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 12 }}>
                          <MapPin size={14} color="var(--muted)" style={{ marginTop: 2, flexShrink: 0 }} />
                          <span style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.4 }}>
                            {o.deliveryAddress || 'Pickup Counter'}
                          </span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 4 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 2, color: 'var(--green)', fontWeight: 700, fontSize: 13 }}>
                            <DollarSign size={13} style={{ marginRight: -2 }} />
                            {o.totalAmount || o.total || 0}
                          </div>

                          {col.key !== 'delivered' && (
                            <button 
                              className="btn btn-ghost" 
                              style={{ padding: '4px 10px', height: 28, fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}
                              onClick={() => advance(o._id || o.id, col.key)}
                              disabled={updatingId === (o._id || o.id)}
                            >
                              {updatingId === (o._id || o.id) ? (
                                <Loader2 className="spin" size={10} />
                              ) : (
                                <>
                                  Next <ChevronRight size={10} />
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {colOrders.length === 0 && (
                    <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '36px 12px', fontSize: 11, border: '1.5px dashed var(--border)', borderRadius: 12 }}>
                      No orders
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
