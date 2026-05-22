import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Image, ShieldAlert, Award } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();

  // Form States
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profilePicture, setProfilePicture] = useState(user?.profile_picture || '');
  const [imageUploadType, setImageUploadType] = useState(
    user?.profile_picture?.startsWith('data:image/') ? 'file' : 'url'
  );
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        alert('File size exceeds 8MB. Please select a smaller image.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentPassword) {
      setError('You must enter your current password to save changes.');
      return;
    }

    setLoading(true);

    try {
      await updateProfile({
        username,
        email,
        password: currentPassword,
        newPassword: newPassword || undefined,
        profile_picture: profilePicture || null
      });

      setSuccess('Profile configuration saved successfully!');
      setNewPassword('');
      setCurrentPassword('');
    } catch (err) {
      setError(err.message || 'Failed to update profile settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '0 20px 40px 20px', maxWidth: '700px', margin: '0 auto' }} className="animate-fade-in">
      <div className="glass-card" style={{ padding: '40px', borderRadius: 'var(--border-radius-lg)', position: 'relative' }}>
        
        {/* Glow Element */}
        <div style={{
          position: 'absolute',
          top: '-20px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80%',
          height: '4px',
          background: 'var(--accent-gradient)',
          borderRadius: '2px',
          boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
        }} />

        {/* Profile Card Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          marginBottom: '32px',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '24px'
        }}>
          {profilePicture ? (
            <img 
              src={profilePicture} 
              alt={username} 
              style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid var(--accent-primary)',
                boxShadow: '0 0 15px rgba(99,102,241,0.2)'
              }}
            />
          ) : (
            <div style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              fontSize: '1.8rem',
              color: 'white',
              boxShadow: '0 0 15px rgba(99,102,241,0.2)'
            }}>
              {username.charAt(0).toUpperCase()}
            </div>
          )}

          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'white' }}>{username}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
              {user?.is_admin === 1 ? (
                <>
                  <Award size={14} style={{ color: 'var(--accent-secondary)' }} />
                  <span>Moderator Administrator</span>
                </>
              ) : (
                <>
                  <User size={14} />
                  <span>Community Member</span>
                </>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--border-radius-sm)',
            padding: '12px 16px',
            color: 'var(--accent-danger)',
            fontSize: '0.9rem',
            marginBottom: '24px'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--border-radius-sm)',
            padding: '12px 16px',
            color: 'var(--accent-success)',
            fontSize: '0.9rem',
            marginBottom: '24px'
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div className="form-group">
            <label className="form-label">Username</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{ paddingLeft: '44px' }}
              />
              <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ paddingLeft: '44px' }}
              />
              <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          {/* Profile Picture Upload/URL Selection */}
          <div className="form-group">
            <label className="form-label">Profile Avatar Photograph</label>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
              <button
                type="button"
                className={`btn ${imageUploadType === 'file' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => { setImageUploadType('file'); setProfilePicture(''); }}
                style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}
              >
                Upload Avatar File
              </button>
              <button
                type="button"
                className={`btn ${imageUploadType === 'url' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => { setImageUploadType('url'); setProfilePicture(''); }}
                style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}
              >
                Provide Image Link
              </button>
            </div>

            {imageUploadType === 'file' ? (
              <div style={{
                border: '2px dashed var(--border-color)',
                borderRadius: 'var(--border-radius-sm)',
                padding: '24px',
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.01)',
                transition: 'var(--transition-smooth)',
                position: 'relative',
                cursor: 'pointer'
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) {
                  if (!file.type.startsWith('image/')) {
                    alert('Please drop an image file.');
                    return;
                  }
                  if (file.size > 8 * 1024 * 1024) {
                    alert('File is too large. Max size is 8MB.');
                    return;
                  }
                  const reader = new FileReader();
                  reader.onloadend = () => setProfilePicture(reader.result);
                  reader.readAsDataURL(file);
                }
              }}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer'
                  }}
                />
                {profilePicture ? (
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img
                      src={profilePicture}
                      alt="Preview"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '180px',
                        borderRadius: '50%',
                        width: '120px',
                        height: '120px',
                        objectFit: 'cover',
                        boxShadow: '0 0 20px rgba(0,0,0,0.4)',
                        border: '2px solid var(--border-color)'
                      }}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setProfilePicture('');
                      }}
                      style={{
                        position: 'absolute',
                        top: '0px',
                        right: '0px',
                        background: 'var(--accent-danger)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.5)'
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-secondary)' }}>
                    <Image size={32} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                    <p style={{ margin: '4px 0', fontWeight: '600' }}>Drag & drop your avatar here, or click to browse</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Supports JPG, PNG, GIF up to 8MB</p>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                <input
                  type="url"
                  className="form-input"
                  placeholder="e.g. https://domain.com/avatar.jpg"
                  value={profilePicture}
                  onChange={(e) => setProfilePicture(e.target.value)}
                  style={{ paddingLeft: '44px' }}
                />
                <Image size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            )}
          </div>

          {/* New Password */}
          <div className="form-group" style={{
            background: 'rgba(255,255,255,0.01)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--border-radius-sm)',
            padding: '20px',
            marginBottom: '24px'
          }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '12px', color: 'white' }}>Change Password (Optional)</h4>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-input"
                placeholder="Enter new password (min. 6 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ paddingLeft: '44px' }}
              />
              <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          {/* Current Password (Verifying Credentials) */}
          <div className="form-group" style={{ marginBottom: '32px' }}>
            <label className="form-label" style={{ color: 'var(--accent-secondary)', fontWeight: '600' }}>
              Verify Current Password (Required to Apply Changes)
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-input"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                style={{ paddingLeft: '44px', borderColor: 'rgba(236, 72, 153, 0.3)' }}
              />
              <ShieldAlert size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-secondary)' }} />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '14px', borderRadius: 'var(--border-radius-sm)', fontSize: '1rem' }}
          >
            {loading ? 'Saving adjustments...' : 'Save Configuration Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
