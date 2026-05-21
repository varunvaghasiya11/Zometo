import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Loader2, Package, Tag } from 'lucide-react';
import StatCard from '../components/StatCard';
import { getFoodItems } from '../store/slices/authSlice';
import api from '../api/api';

export default function Dashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [stats, setStats] = useState({
    revenue: 0,
    totalOrders: 0,
    menuItemsCount: 0,
    activeOrdersCount: 0,
  });
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [ordersRes, foodsResAction] = await Promise.all([
          api.get('/orders'),
          dispatch(getFoodItems())
        ]);

        const orders = Array.isArray(ordersRes.data) ? ordersRes.data : (ordersRes.data?.data || []);
        const fetchedFoods = Array.isArray(foodsResAction.payload) ? foodsResAction.payload : [];
        setFoods(fetchedFoods);

        const deliveredOrders = orders.filter(o => o.status === 'delivered');
        const revenue = deliveredOrders.reduce((sum, o) => sum + (o.totalAmount || o.total || 0), 0);

        const activeOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');

        setStats({
          revenue,
          totalOrders: orders.length,
          menuItemsCount: fetchedFoods.length,
          activeOrdersCount: activeOrders.length
        });
      } catch (error) {
        console.error('Error fetching dashboard statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [dispatch]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:image/') || imagePath.startsWith('blob:')) {
      return imagePath;
    }
    return `https://zomato-clone-api-5e4m.onrender.com${imagePath}`;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 0', gap: '16px' }}>
        <Loader2 className="spin" size={40} color="var(--red)" />
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Compiling dashboard metrics…</p>
      </div>
    );
  }

  return (
    <div className="page fade-in">
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <StatCard label="Total Revenue" value={`₹${stats.revenue.toLocaleString()}`} change="100%" changeType="up" icon="💰" color="#22c55e" />
        <StatCard label="Total Orders" value={stats.totalOrders.toString()} change={`${stats.activeOrdersCount} live`} changeType="up" icon="📦" color="#3b82f6" />
        <StatCard label="Menu Items" value={stats.menuItemsCount.toString()} change="active" changeType="up" icon="🍽️" color="#E23744" />
        <StatCard label="Partner Status" value="Online" change="Verified" changeType="up" icon="⭐" color="#f59e0b" />
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Food Offerings</h3>
          <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 500 }}>
            {foods.length} Dishes Listed
          </span>
        </div>
        
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Dish Info</th>
                <th>Category</th>
                <th>Price</th>
                <th>Description</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {foods.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <Package size={32} style={{ color: 'var(--border)' }} />
                      <span>No food items found. Go to the Menu tab to add dishes!</span>
                    </div>
                  </td>
                </tr>
              ) : (
                foods.map(food => (
                  <tr key={food._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {food.image ? (
                          <img 
                            src={getImageUrl(food.image)} 
                            alt={food.name} 
                            style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border)' }}
                          />
                        ) : (
                          <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                            <Tag size={16} color="var(--muted)" />
                          </div>
                        )}
                        <span style={{ fontWeight: 700, fontSize: '14px' }}>{food.title}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-blue" style={{ textTransform: 'capitalize' }}>
                        {food.category || 'General'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--text)' }}>
                      ₹{food.price}
                    </td>
                    <td style={{ color: 'var(--muted)', fontSize: '13px', maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {food.description || '—'}
                    </td>
                    <td>
                      {food.isAvailable ? (
                        <span className="badge badge-green">In Stock</span>
                      ) : (
                        <span className="badge" style={{ background: 'var(--bg3)', color: 'var(--muted)' }}>Out of Stock</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
