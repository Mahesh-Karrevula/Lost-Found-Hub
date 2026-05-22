import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, Navigation, MapPin, Image, Tag, AlignLeft, Info } from 'lucide-react';

const CreateItem = () => {
  const { authFetch } = useAuth();
  const navigate = useNavigate();

  // Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('lost');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState('');
  const [imageUploadType, setImageUploadType] = useState('file'); // 'file' or 'url'
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

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
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(6));
        setLongitude(position.coords.longitude.toFixed(6));
        setGpsLoading(false);
        // Alert user
        alert('GPS Coordinates populated successfully!');
      },
      (err) => {
        console.error(err);
        alert('Unable to retrieve your location. Please enter coordinates manually.');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await authFetch('/items', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          type,
          location,
          image,
          latitude: latitude ? Number(latitude) : null,
          longitude: longitude ? Number(longitude) : null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Listing posted successfully! Redirecting...');
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        setError(data.message || 'Failed to post item listing');
        setLoading(false);
      }
    } catch (err) {
      setError('Server connection error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '0 20px 40px 20px', maxWidth: '750px', margin: '0 auto' }} className="animate-fade-in">
      <div className="glass-card" style={{ padding: '40px', borderRadius: 'var(--border-radius-lg)', position: 'relative' }}>
        
        {/* Colorful Gradient Border top */}
        <div style={{
          position: 'absolute',
          top: '-20px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '90%',
          height: '4px',
          background: 'var(--accent-gradient)',
          borderRadius: '2px',
          boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
        }} />

        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '8px' }}>Report Lost & Found Item</h2>
          <p style={{ color: 'var(--text-secondary)' }}>File a new record to alert other community members in the area</p>
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
          {/* Item Type selection */}
          <div className="form-group">
            <label className="form-label">Report Class</label>
            <div style={{ display: 'flex', gap: '16px' }}>
              <label style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '14px',
                borderRadius: 'var(--border-radius-sm)',
                border: `1.5px solid ${type === 'lost' ? 'rgba(239, 68, 68, 0.5)' : 'var(--border-color)'}`,
                background: type === 'lost' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(255,255,255,0.01)',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'var(--transition-smooth)'
              }}>
                <input
                  type="radio"
                  name="type"
                  value="lost"
                  checked={type === 'lost'}
                  onChange={() => setType('lost')}
                  style={{ display: 'none' }}
                />
                <span style={{ color: type === 'lost' ? 'var(--accent-danger)' : 'var(--text-secondary)' }}>Lost Belonging</span>
              </label>

              <label style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '14px',
                borderRadius: 'var(--border-radius-sm)',
                border: `1.5px solid ${type === 'found' ? 'rgba(16, 185, 129, 0.5)' : 'var(--border-color)'}`,
                background: type === 'found' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255,255,255,0.01)',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'var(--transition-smooth)'
              }}>
                <input
                  type="radio"
                  name="type"
                  value="found"
                  checked={type === 'found'}
                  onChange={() => setType('found')}
                  style={{ display: 'none' }}
                />
                <span style={{ color: type === 'found' ? 'var(--accent-success)' : 'var(--text-secondary)' }}>Found Belonging</span>
              </label>
            </div>
          </div>

          {/* Title */}
          <div className="form-group">
            <label className="form-label">Item Name / Title</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Black Leather Wallet, Silver iPhone 13"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={{ paddingLeft: '44px' }}
              />
              <Tag size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Item Description</label>
            <div style={{ position: 'relative' }}>
              <textarea
                className="form-input"
                placeholder="Describe unique characteristics, color, labels, contents..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows="4"
                style={{ paddingLeft: '44px', resize: 'vertical' }}
              />
              <AlignLeft size={18} style={{ position: 'absolute', left: '16px', top: '20px', color: 'var(--text-muted)' }} />
            </div>
          </div>

          {/* Location Description */}
          <div className="form-group">
            <label className="form-label">Location Found / Lost</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Central Park playground, Gate 3 of Airport"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                style={{ paddingLeft: '44px' }}
              />
              <MapPin size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          {/* Image Selection Type */}
          <div className="form-group">
            <label className="form-label">Item Photograph</label>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
              <button
                type="button"
                className={`btn ${imageUploadType === 'file' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => { setImageUploadType('file'); setImage(''); }}
                style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}
              >
                Upload Photo File
              </button>
              <button
                type="button"
                className={`btn ${imageUploadType === 'url' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => { setImageUploadType('url'); setImage(''); }}
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
                  reader.onloadend = () => setImage(reader.result);
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
                {image ? (
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img
                      src={image}
                      alt="Preview"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '180px',
                        borderRadius: 'var(--border-radius-sm)',
                        boxShadow: '0 0 20px rgba(0,0,0,0.4)',
                        border: '2px solid var(--border-color)'
                      }}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setImage('');
                      }}
                      style={{
                        position: 'absolute',
                        top: '-10px',
                        right: '-10px',
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
                    <p style={{ margin: '4px 0', fontWeight: '600' }}>Drag & drop your file here, or click to browse</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Supports JPG, PNG, GIF up to 8MB</p>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                <input
                  type="url"
                  className="form-input"
                  placeholder="e.g. https://images.unsplash.com/... or upload link"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  style={{ paddingLeft: '44px' }}
                />
                <Image size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            )}
          </div>

          {/* Map Coordinates with GPS fetch */}
          <div className="form-group" style={{
            background: 'rgba(255,255,255,0.01)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--border-radius-sm)',
            padding: '20px',
            marginBottom: '32px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>Map Coordinates (Optional)</span>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleGetLocation}
                disabled={gpsLoading}
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              >
                <Navigation size={14} style={{ animation: gpsLoading ? 'spin 1s linear infinite' : 'none' }} />
                {gpsLoading ? 'Locating...' : 'Fetch Current GPS'}
              </button>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Latitude</label>
                <input
                  type="number"
                  step="0.000001"
                  className="form-input"
                  placeholder="e.g. 40.7128"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Longitude</label>
                <input
                  type="number"
                  step="0.000001"
                  className="form-input"
                  placeholder="e.g. -74.0060"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '14px', borderRadius: 'var(--border-radius-sm)', fontSize: '1rem' }}
          >
            {loading ? 'Filing Report...' : 'Publish Listing'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateItem;
