import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ label, value, change, changeType = 'up', icon, color = '#E23744' }) {
  return (
    <div className="stat-card fade-in">
      <div className="stat-icon" style={{ background: `${color}22` }}>
        <span style={{ color, fontSize: 20 }}>{icon}</span>
      </div>
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      <div className={`change ${changeType}`}>
        {changeType === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {change} vs last week
      </div>
    </div>
  );
}
