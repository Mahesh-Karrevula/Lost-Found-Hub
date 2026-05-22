import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, CheckCircle, Trash2, AlertCircle, ArrowLeft, MapPin, Calendar, Tag, ShieldAlert } from 'lucide-react';

const ItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, authFetch } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Report Spam Modal State
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSuccess, setReportSuccess] = useState('');
  const [reportError, setReportError] = useState('');
  const [hasReported, setHasReported] = useState(false);

  const fetchItemDetails = async () => {
    try {
      const response = await authFetch(`/items/${id}`);
      if (response.ok) {
        const data = await response.json();
        setItem(data);
        
        // Also check if the user has already reported this item
        const reportRes = await authFetch(`/reports/item/${id}/status`);
        if (reportRes.ok) {
          const reportData = await reportRes.json();
          setHasReported(reportData.reported);
        }
      } else {
        setError('Item not found or has been removed');
      }
    } catch (err) {
      setError('Error loading item details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItemDetails();
  }, [id]);

  const handleResolve = async () => {
    if (window.confirm("Are you sure you want to mark this item as resolved?")) {
      try {
        const response = await authFetch(`/items/${id}/resolve`, {
          method: 'PUT'
        });
        if (response.ok) {
          alert('Item marked as resolved successfully.');
          fetchItemDetails();
        } else {
          alert('Failed to resolve item.');
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this listing permanently? This cannot be undone.")) {
      try {
        const response = await authFetch(`/items/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          alert('Listing deleted successfully.');
          navigate('/');
        } else {
          alert('Failed to delete item.');
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleContactOwner = async () => {
    try {
      const response = await authFetch('/messages/conversations', {
        method: 'POST',
        body: JSON.stringify({ otherUserId: item.user_id })
      });
      if (response.ok) {
        const conv = await response.json();
        // Redirect to chat page with the conversation id
        navigate('/chat', { state: { conversationId: conv.id } });
      } else {
        alert('Failed to open chat conversation.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setReportError('');
    setReportSuccess('');

    if (!reportReason.trim()) {
      setReportError('Please enter a reason for reporting');
      return;
    }

    try {
      // Submit regular report (for moderation flag)
      const reportRes = await authFetch('/reports', {
        method: 'POST',
        body: JSON.stringify({ item_id: id, reason: reportReason })
      });

      // Submit spam report
      const spamRes = await authFetch('/spam', {
        method: 'POST',
        body: JSON.stringify({ item_id: id, reason: reportReason })
      });

      if (reportRes.ok && spamRes.ok) {
        setReportSuccess('Thank you. The item report has been submitted to moderators for review.');
        setReportReason('');
        setHasReported(true);
        setTimeout(() => setShowReportForm(false), 3000);
      } else {
        const data = await reportRes.json();
        setReportError(data.message || 'Failed to submit report');
      }
    } catch (err) {
      setReportError('Server error reporting item');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <div style={{
          border: '3px solid rgba(255, 255, 255, 0.1)',
          borderTop: '3px solid var(--accent-primary)',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px auto'
        }} />
        <span style={{ color: 'var(--text-secondary)' }}>Retrieving detailed files...</span>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div style={{ padding: '40px 20px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <div className="glass-card" style={{ padding: '40px' }}>
          <AlertCircle size={48} style={{ color: 'var(--accent-danger)', marginBottom: '16px' }} />
          <h2 style={{ marginBottom: '12px' }}>Inspection Failure</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>{error || 'Listing not found.'}</p>
          <Link to="/" className="btn btn-primary">
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user && user.id === item.user_id;
  const isAdmin = user && user.is_admin === 1;

  return (
    <div style={{ padding: '0 20px 40px 20px', maxWidth: '1000px', margin: '0 auto' }} className="animate-fade-in">
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'var(--text-secondary)', marginBottom: '24px', fontWeight: '500' }}>
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '30px'
      }}>
        {/* Left Column: Image Card */}
        <div className="glass-card" style={{ borderRadius: 'var(--border-radius-md)', overflow: 'hidden', height: 'fit-content' }}>
          <div style={{ height: '320px', width: '100%', position: 'relative', background: 'rgba(0,0,0,0.3)' }}>
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
                color: 'rgba(255,255,255,0.06)',
                fontSize: '5rem',
                fontWeight: '900'
              }}>
                {item.type.toUpperCase()}
              </div>
            )}
            
            {/* Overlay badges */}
            <div style={{ position: 'absolute', top: '16px', left: '16px' }}>
              <span className={`badge ${item.type === 'lost' ? 'badge-lost' : 'badge-found'}`} style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
                {item.type}
              </span>
            </div>
            
            <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
              <span className={`badge ${item.status === 'active' ? 'badge-active' : 'badge-resolved'}`} style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
                {item.status}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(15, 23, 42, 0.4)' }}>
            {isOwner ? (
              <>
                {item.status === 'active' && (
                  <button className="btn btn-primary" onClick={handleResolve} style={{ width: '100%' }}>
                    <CheckCircle size={18} />
                    Mark as Resolved
                  </button>
                )}
                <button className="btn btn-danger" onClick={handleDelete} style={{ width: '100%' }}>
                  <Trash2 size={18} />
                  Delete Listing
                </button>
              </>
            ) : (
              <>
                <button className="btn btn-primary" onClick={handleContactOwner} style={{ width: '100%' }}>
                  <MessageSquare size={18} />
                  Contact Reporter
                </button>
                
                {hasReported ? (
                  <div style={{
                    padding: '12px',
                    borderRadius: 'var(--border-radius-sm)',
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                    color: 'var(--accent-warning)',
                    fontSize: '0.85rem',
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}>
                    <ShieldAlert size={16} />
                    <span>You have reported this item.</span>
                  </div>
                ) : (
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => setShowReportForm(!showReportForm)} 
                    style={{ width: '100%', borderColor: 'rgba(239, 68, 68, 0.3)', color: 'var(--accent-danger)' }}
                  >
                    <ShieldAlert size={18} />
                    Flag / Report Spam
                  </button>
                )}

                {/* Admin fallback delete */}
                {isAdmin && (
                  <button className="btn btn-danger" onClick={handleDelete} style={{ width: '100%', marginTop: '10px' }}>
                    <Trash2 size={18} />
                    Moderator Delete
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Column: Item Information */}
        <div className="glass-card" style={{ padding: '40px', borderRadius: 'var(--border-radius-md)' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '16px' }}>{item.title}</h2>
          
          {/* Metadata items list */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '30px',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <MapPin size={16} style={{ color: 'var(--accent-primary)' }} />
              <span>{item.location}</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <Calendar size={16} style={{ color: 'var(--accent-secondary)' }} />
              <span>Reported on: {item.created_at}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <Tag size={16} style={{ color: 'var(--accent-success)' }} />
              <span>Reporter: <strong style={{ color: 'white' }}>{item.username}</strong></span>
            </div>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '12px' }}>Description</h4>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '1rem', whiteSpace: 'pre-wrap' }}>
              {item.description}
            </p>
          </div>

          {/* Coordinate maps details if exists */}
          {(item.latitude || item.longitude) && (
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--border-radius-sm)',
              padding: '20px'
            }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-secondary)' }}>Geographic Coordinates</h4>
              <div style={{ display: 'flex', gap: '16px', fontSize: '0.9rem' }}>
                <div>Latitude: <strong style={{ color: 'var(--accent-primary)' }}>{item.latitude || 'N/A'}</strong></div>
                <div>Longitude: <strong style={{ color: 'var(--accent-secondary)' }}>{item.longitude || 'N/A'}</strong></div>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                *Use these coordinates to pinpoint exact lost/found area on external map.
              </p>
            </div>
          )}

          {/* Report Spam Form */}
          {showReportForm && (
            <div className="glass-card animate-fade-in" style={{
              marginTop: '30px',
              padding: '24px',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              background: 'rgba(239, 68, 68, 0.03)'
            }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-danger)', marginBottom: '12px' }}>
                <ShieldAlert size={18} />
                Report Listing
              </h4>

              {reportError && (
                <p style={{ color: 'var(--accent-danger)', fontSize: '0.85rem', marginBottom: '12px' }}>{reportError}</p>
              )}
              {reportSuccess && (
                <p style={{ color: 'var(--accent-success)', fontSize: '0.85rem', marginBottom: '12px' }}>{reportSuccess}</p>
              )}

              <form onSubmit={handleReportSubmit}>
                <div className="form-group">
                  <label className="form-label">Reason for reporting</label>
                  <textarea
                    className="form-input"
                    placeholder="Describe why this listing is spam, duplicates, or fraudulent..."
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    required
                    rows="3"
                    style={{ resize: 'vertical' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="submit" className="btn btn-danger" style={{ flex: 1 }}>Submit Flag</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowReportForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemDetails;
