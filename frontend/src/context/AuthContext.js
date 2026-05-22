import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  // Set API base URL
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchProfile = async () => {
      if (token) {
        try {
          const response = await fetch(`${API_URL}/users/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            setUser(data);
          } else {
            // Token expired or invalid
            logout();
          }
        } catch (error) {
          console.error("Error fetching user profile", error);
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, [token]);

  const login = async (username, password) => {
    const response = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser({
      _id: data._id,
      id: data.id,
      username: data.username,
      email: data.email,
      profile_picture: data.profile_picture,
      is_admin: data.is_admin
    });
    return data;
  };

  const register = async (username, email, password) => {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser({
      _id: data._id,
      id: data.id,
      username: data.username,
      email: data.email,
      profile_picture: data.profile_picture,
      is_admin: data.is_admin
    });
    return data;
  };

  const updateProfile = async (profileData) => {
    const response = await fetch(`${API_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update profile');
    }

    // Update token if returned (optional, but good practice)
    if (data.token) {
      localStorage.setItem('token', data.token);
      setToken(data.token);
    }

    setUser({
      _id: data._id,
      id: data.id,
      username: data.username,
      email: data.email,
      profile_picture: data.profile_picture,
      is_admin: data.is_admin
    });

    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
  };

  const authFetch = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}${url}`, {
      ...options,
      headers
    });
    return res;
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    authFetch,
    API_URL
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
