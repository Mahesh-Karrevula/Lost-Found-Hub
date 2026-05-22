import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Trash2, Check, RefreshCw, AlertTriangle, AlertCircle } from 'lucide-react';

const AdminDashboard = () => {
  const { authFetch } = useAuth();
  
  // States
  const [reports, setReports] = useState([]);
  const [spamReports, setSpamReports] = useState([]);
  const [spamCounts, setSpamCounts] = useState({ pending: 0, reviewed: 0, resolved: 0, dismissed: 0 });
  const [activeTab, setActiveTab] = useState('flagged'); // 'flagged' or 'spam'
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch item reports
      const reportsRes = await authFetch('/reports');
      if (reportsRes.ok) {
        const reportsData = await reportsRes.json();
        setReports(reportsData);
      }

      // 2. Fetch spam reports
      const spamRes = await authFetch('/spam');
      if (spamRes.ok) {
        const spamData = await spamRes.json();
        setSpamReports(spamData);
      }

      // 3. Fetch spam counts
      const countsRes = await authFetch('/spam/counts');
      if (countsRes.ok) {
        const countsData = await countsRes.json();
        setSpamCounts(countsData);
      }
    } catch (err) {
      console.error("Error loading admin data", err);
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleProcessReport = async (reportId, deleteItem) => {
    const actionText = deleteItem 
      ? "This will delete BOTH the report and the listing permanently. Continue?" 
      : "This will dismiss the report and clear the reported status. Continue?";
      
    if (window.confirm(actionText)) {
      try {
        const response = await authFetch(`/reports/${reportId}?deleteItem=${deleteItem}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          alert('Report processed successfully');
          fetchDashboardData(); // reload
        } else {
          alert('Failed to process report');
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleUpdateSpamStatus = async (reportId, newStatus) => {
    try {
      const response = await authFetch(`/spam/${reportId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        alert(`Spam report status updated to ${newStatus}`);
        fetchDashboardData();
      } else {
        alert('Failed to update status');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '0 20px 40px 20px', maxWidth: '1200px', margin: '0 auto' }} className="animate-fade-in">
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldAlert size={28} style={{ color: 'var(--accent-secondary)' }} />
            Moderator Control Center
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>Review flagged content reports and manage community integrity</p>
        </div>
        
        <button className="btn btn-secondary" onClick={fetchDashboardData} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RefreshCw size={16} style={{ animation: loading ? 'spin 1.5s linear infinite' : 'none' }} />
          Sync
        </button>
      </div>

      {/* Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '45px'
      }}>
        <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-danger)' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <span style={{ fontSize: '1.8rem', fontWeight: '800' }}>{reports.length}</span>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Flagged Item Reports</p>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-warning)' }}>
            <AlertCircle size={24} />
          </div>
          <div>
            <span style={{ fontSize: '1.8rem', fontWeight: '800' }}>{spamCounts.pending}</span>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Pending Spam Reports</p>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)' }}>
            <Check size={24} />
          </div>
          <div>
            <span style={{ fontSize: '1.8rem', fontWeight: '800' }}>{spamCounts.reviewed + spamCounts.resolved + spamCounts.dismissed}</span>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Processed Spam Cases</p>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border-color)',
        marginBottom: '30px',
        gap: '24px'
      }}>
        <button
          onClick={() => setActiveTab('flagged')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'flagged' ? '3px solid var(--accent-primary)' : '3px solid transparent',
            color: activeTab === 'flagged' ? 'white' : 'var(--text-secondary)',
            fontSize: '1.05rem',
            fontWeight: '600',
            paddingBottom: '12px',
            cursor: 'pointer',
            transition: 'var(--transition-smooth)'
          }}
        >
          Flagged Items ({reports.length})
        </button>
        <button
          onClick={() => setActiveTab('spam')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'spam' ? '3px solid var(--accent-primary)' : '3px solid transparent',
            color: activeTab === 'spam' ? 'white' : 'var(--text-secondary)',
            fontSize: '1.05rem',
            fontWeight: '600',
            paddingBottom: '12px',
            cursor: 'pointer',
            transition: 'var(--transition-smooth)'
          }}
        >
          Spam Incidents ({spamReports.length})
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          Syncing moderator records...
        </div>
      ) : activeTab === 'flagged' ? (
        /* Flagged Items Reports Table */
        reports.length === 0 ? (
          <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No flagged item listings reported in the system.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {reports.map((r) => (
              <div key={r.id} className="glass-card animate-fade-in" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ flexGrow: 1, minWidth: '250px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>Report ID: #{r.id}</span>
                  <h4 style={{ fontSize: '1.15rem', color: 'white', marginTop: '4px', marginBottom: '8px' }}>
                    Item: <strong style={{ color: 'var(--accent-primary)' }}>{r.item_title}</strong>
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '10px' }}>
                    Reason: <span style={{ color: 'white', fontStyle: 'italic' }}>"{r.reason}"</span>
                  </p>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>Reporter: <strong>{r.reporter_name}</strong></span>
                    <span>Filed: <strong>{r.created_at}</strong></span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-secondary" onClick={() => handleProcessReport(r.id, false)} style={{ fontSize: '0.8rem', padding: '8px 14px' }}>
                    <Check size={14} style={{ color: 'var(--accent-success)' }} />
                    Dismiss Flag
                  </button>
                  <button className="btn btn-danger" onClick={() => handleProcessReport(r.id, true)} style={{ fontSize: '0.8rem', padding: '8px 14px' }}>
                    <Trash2 size={14} />
                    Delete Item
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Spam Reports Table */
        spamReports.length === 0 ? (
          <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No spam incidents reported.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {spamReports.map((sr) => (
              <div key={sr.id} className="glass-card animate-fade-in" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ flexGrow: 1, minWidth: '250px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-warning)', fontWeight: '700', textTransform: 'uppercase' }}>Spam ID: #{sr.id}</span>
                    <span className={`badge ${
                      sr.status === 'pending' ? 'badge-active' : 'badge-resolved'
                    }`} style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                      {sr.status}
                    </span>
                  </div>
                  
                  <h4 style={{ fontSize: '1.15rem', color: 'white', marginBottom: '8px' }}>
                    Item: <strong style={{ color: 'var(--accent-primary)' }}>{sr.item_title}</strong>
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '10px' }}>
                    Reason: <span style={{ color: 'white', fontStyle: 'italic' }}>"{sr.reason}"</span>
                  </p>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>Reporter: <strong>{sr.reporter_name}</strong></span>
                    <span>Filed: <strong>{sr.created_at}</strong></span>
                  </div>
                </div>

                {/* Status modifiers dropdown or buttons */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <select 
                    className="form-input" 
                    value={sr.status}
                    onChange={(e) => handleUpdateSpamStatus(sr.id, e.target.value)}
                    style={{ padding: '6px 12px', fontSize: '0.8rem', width: '130px' }}
                  >
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="resolved">Resolved</option>
                    <option value="dismissed">Dismissed</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default AdminDashboard;
