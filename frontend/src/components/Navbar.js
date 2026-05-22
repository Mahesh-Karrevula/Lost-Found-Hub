import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, MessageSquare, PlusCircle, LogOut, ShieldAlert, Compass } from 'lucide-react';

const Navbar = () => {
  const { user, logout, authFetch } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await authFetch('/notifications/unread');
        if (response.ok) {
          const data = await response.json();
          setNotifications(data);
        }
      } catch (error) {
        console.error("Error fetching notifications", error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, [authFetch]);

  const handleMarkAsRead = async (id) => {
    try {
      const response = await authFetch(`/notifications/${id}/read`, {
        method: 'PUT'
      });
      if (response.ok) {
        setNotifications(notifications.filter(n => n.id !== id));
      }
    } catch (error) {
      console.error("Error marking notification read", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="glass-card" style={{
      margin: '15px 20px',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: '15px',
      zIndex: 100,
      borderRadius: 'var(--border-radius-md)'
    }}>
      {/* Brand */}
      <Link to="/" style={{
        textDecoration: 'none',
        background: 'var(--accent-gradient)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontSize: '1.45rem',
        fontWeight: '800',
        letterSpacing: '-0.5px'
      }}>
        Lost&Found Hub
      </Link>

      {/* Nav Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Link to="/" className={`btn ${isActive('/') ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '8px 16px', borderRadius: '20px' }}>
          <Compass size={18} />
          Explore
        </Link>
        <Link to="/create" className={`btn ${isActive('/create') ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '8px 16px', borderRadius: '20px' }}>
          <PlusCircle size={18} />
          Report Item
        </Link>
        <Link to="/chat" className={`btn ${isActive('/chat') ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '8px 16px', borderRadius: '20px' }}>
          <MessageSquare size={18} />
          Chat
        </Link>
        {user && user.is_admin === 1 && (
          <Link to="/admin" className={`btn ${isActive('/admin') ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '8px 16px', borderRadius: '20px' }}>
            <ShieldAlert size={18} />
            Moderator
          </Link>
        )}
      </div>

      {/* User Area */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
        {/* Notification bell */}
        <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setShowNotifications(!showNotifications)}>
          <div style={{
            padding: '8px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: notifications.length > 0 ? 'var(--accent-secondary)' : 'var(--text-secondary)'
          }}>
            <Bell size={18} />
          </div>
          {notifications.length > 0 && (
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: 'var(--accent-secondary)',
              color: 'white',
              fontSize: '0.7rem',
              fontWeight: '700',
              padding: '2px 6px',
              borderRadius: '10px',
              border: '2px solid var(--bg-primary)'
            }}>
              {notifications.length}
            </span>
          )}

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="glass-card animate-fade-in" style={{
              position: 'absolute',
              top: '45px',
              right: '0',
              width: '320px',
              maxHeight: '400px',
              overflowY: 'auto',
              padding: '16px',
              zIndex: 101,
              borderRadius: 'var(--border-radius-md)'
            }} onClick={(e) => e.stopPropagation()}>
              <h4 style={{ marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                Unread Notifications
              </h4>
              {notifications.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '12px 0' }}>
                  No new notifications
                </p>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} style={{
                    padding: '10px 0',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{n.message}</span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{n.created_at}</span>
                      <button 
                        onClick={() => handleMarkAsRead(n.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--accent-primary)',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        Mark read
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Profile */}
        <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'inherit' }}>
          {user && user.profile_picture ? (
            <img 
              src={user.profile_picture} 
              alt={user.username} 
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '1.5px solid var(--accent-primary)'
              }}
            />
          ) : (
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '0.9rem',
              color: 'white'
            }}>
              {user ? user.username.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
          <span style={{ fontWeight: '500', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {user ? user.username : 'Guest'}
          </span>
        </Link>

        {/* Logout */}
        <button className="btn btn-secondary" onClick={handleLogout} style={{ padding: '8px', borderRadius: '50%' }} title="Logout">
          <LogOut size={16} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
