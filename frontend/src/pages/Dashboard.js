import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, MapPin, Calendar, ArrowRight, Tag, Filter } from 'lucide-react';

const Dashboard = () => {
  const { authFetch } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ items: 0, users: 0 });

  // Filter States
  const [keyword, setKeyword] = useState('');
  const [type, setType] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');

  const fetchItems = async () => {
    setLoading(true);
    try {
      // Build query string
      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      if (type) params.append('type', type);
      if (location) params.append('location', location);
      if (date) params.append('date', date);

      const response = await authFetch(`/items?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      console.error("Error fetching items", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    
    // Fetch stats for header info cards
    const fetchStats = async () => {
      try {
        const itemsRes = await authFetch('/items');
        const usersRes = await authFetch('/users');
        if (itemsRes.ok && usersRes.ok) {
          const itemsData = await itemsRes.json();
          const usersData = await usersRes.json();
          setStats({
            items: itemsData.length,
            users: usersData.length + 1 // Add 1 for the current user
          });
        }
      } catch (error) {
        console.error("Error fetching stats", error);
      }
    };
    fetchStats();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchItems();
  };

  const handleClearFilters = () => {
    setKeyword('');
    setType('');
    setLocation('');
    setDate('');
    // We must fetch after clearing states
    setTimeout(fetchItems, 0);
  };

  return (
    <div style={{ padding: '0 20px 40px 20px', maxWidth: '1200px', margin: '0 auto' }} className="animate-fade-in">
      {/* Header welcome banner */}
      <div className="glass-card" style={{
        padding: '40px',
        borderRadius: 'var(--border-radius-lg)',
        marginBottom: '30px',
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '8px', lineHeight: '1.2' }}>
            Find What You Lost,<br />Return What You Found
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', fontSize: '1.05rem' }}>
            A premium community-driven platform to connect lost belongings with their owners. Join the network and help others.
          </p>
        </div>

        {/* Quick Info Grid */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <div className="glass-card" style={{ padding: '20px 30px', textAlign: 'center', minWidth: '130px' }}>
            <span style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--accent-primary)' }}>{stats.items}</span>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Total Items</p>
          </div>
          <div className="glass-card" style={{ padding: '20px 30px', textAlign: 'center', minWidth: '130px' }}>
            <span style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--accent-secondary)' }}>{stats.users}</span>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Active Users</p>
          </div>
        </div>
      </div>

      {/* Search and Filters panel */}
      <div className="glass-card" style={{ padding: '24px', borderRadius: 'var(--border-radius-md)', marginBottom: '30px' }}>
        <form onSubmit={handleSearchSubmit} style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          alignItems: 'end'
        }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Keyword Search</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search title, description..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                style={{ paddingLeft: '40px' }}
              />
              <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Type</label>
            <select
              className="form-input"
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={{ appearance: 'none', background: 'rgba(15, 23, 42, 0.6)' }}
            >
              <option value="">All Types</option>
              <option value="lost">Lost</option>
              <option value="found">Found</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Location</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search location..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={{ paddingLeft: '40px' }}
              />
              <MapPin size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Date Reported</label>
            <div style={{ position: 'relative' }}>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{ paddingLeft: '40px' }}
              />
              <Calendar size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '12px' }}>
              <Filter size={16} />
              Filter
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleClearFilters} style={{ padding: '12px' }}>
              Clear
            </button>
          </div>
        </form>
      </div>

      {/* Items Grid */}
      <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '20px' }}>Recent Board Filings</h3>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{
            border: '3px solid rgba(255, 255, 255, 0.1)',
            borderTop: '3px solid var(--accent-primary)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px auto'
          }} />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <span style={{ color: 'var(--text-secondary)' }}>Loading items board...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '16px' }}>
            No listings found matching your search.
          </p>
          <button className="btn btn-primary" onClick={handleClearFilters}>
            Reset Board Filters
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {items.map((item) => (
            <div key={item.id} className="glass-card animate-fade-in" style={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              overflow: 'hidden',
              borderRadius: 'var(--border-radius-md)'
            }}>
              {/* Card Image */}
              <div style={{ height: '170px', width: '100%', position: 'relative', background: 'rgba(0,0,0,0.2)' }}>
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    background: item.type === 'lost' 
                      ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(15, 23, 42, 0.5) 100%)' 
                      : 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(15, 23, 42, 0.5) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(255,255,255,0.1)',
                    fontSize: '3rem',
                    fontWeight: '800'
                  }}>
                    {item.type === 'lost' ? 'LOST' : 'FOUND'}
                  </div>
                )}

                {/* Type Badge */}
                <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                  <span className={`badge ${item.type === 'lost' ? 'badge-lost' : 'badge-found'}`}>
                    {item.type}
                  </span>
                </div>

                {/* Status Badge */}
                <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                  <span className={`badge ${item.status === 'active' ? 'badge-active' : 'badge-resolved'}`}>
                    {item.status}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <h4 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px', color: 'white' }}>{item.title}</h4>
                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                  marginBottom: '16px',
                  flexGrow: 1,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {item.description}
                </p>

                {/* Meta details */}
                <div style={{
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                  paddingTop: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  marginBottom: '20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <MapPin size={14} />
                    <span>{item.location}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <Calendar size={14} />
                    <span>Reported: {item.created_at.substring(0, 10)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <Tag size={14} />
                    <span>Posted by: <strong style={{ color: 'var(--text-secondary)' }}>{item.username}</strong></span>
                  </div>
                </div>

                {/* View Details Link */}
                <Link to={`/items/${item.id}`} className="btn btn-secondary" style={{ width: '100%', fontSize: '0.85rem' }}>
                  Inspect Item
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
