import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Send, MessageSquare, Users, Inbox, Search } from 'lucide-react';

const Chat = () => {
  const { user, authFetch } = useAuth();
  const location = useLocation();
  const messagesEndRef = useRef(null);

  // States
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [usersList, setUsersList] = useState([]);
  
  const [showUsersDirectory, setShowUsersDirectory] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [activeRecipient, setActiveRecipient] = useState(null);

  // Fetch Conversations List
  const fetchConversations = useCallback(async () => {
    try {
      const response = await authFetch('/messages/conversations');
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
        return data;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingConvs(false);
    }
  }, [authFetch]);

  // Fetch Messages for active conversation
  const fetchMessages = useCallback(async (convId) => {
    if (!convId) return;
    try {
      const response = await authFetch(`/messages/conversations/${convId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, [authFetch]);

  // Fetch Users Directory
  const fetchUsersDirectory = useCallback(async () => {
    try {
      const response = await authFetch('/users');
      if (response.ok) {
        const data = await response.json();
        setUsersList(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, [authFetch]);

  const handleSelectConversation = useCallback((convId, currentConvs = conversations) => {
    setActiveConvId(convId);
    setShowUsersDirectory(false);

    // Find other user details from conversations list
    const conv = currentConvs.find(c => c.id === convId);
    if (conv) {
      setActiveRecipient({
        id: conv.other_user_id,
        username: conv.username,
        profile_picture: conv.profile_picture
      });
    }
  }, [conversations]);

  // Initialize
  useEffect(() => {
    fetchConversations().then((convs) => {
      // Check if redirected with a conversationId in state
      if (location.state && location.state.conversationId) {
        const stateConvId = location.state.conversationId;
        handleSelectConversation(stateConvId, convs);
      }
    });
    fetchUsersDirectory();
  }, [location.state, fetchConversations, fetchUsersDirectory, handleSelectConversation]);

  // Messages Polling
  useEffect(() => {
    if (!activeConvId) return;
    
    // Initial fetch
    fetchMessages(activeConvId);
    
    // Poll every 3 seconds
    const interval = setInterval(() => {
      fetchMessages(activeConvId);
    }, 3000);

    return () => clearInterval(interval);
  }, [activeConvId, fetchMessages]);

  // Scroll to bottom helper
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleStartNewChat = async (targetUser) => {
    try {
      const response = await authFetch('/messages/conversations', {
        method: 'POST',
        body: JSON.stringify({ otherUserId: targetUser.id })
      });
      if (response.ok) {
        const data = await response.json();
        
        // Refresh conversations list first
        await fetchConversations();
        
        // Open the conversation
        setActiveConvId(data.id);
        setActiveRecipient(targetUser);
        setShowUsersDirectory(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConvId) return;

    const messageText = newMessage;
    setNewMessage(''); // optimistic UI clear

    try {
      const response = await authFetch(`/messages/conversations/${activeConvId}`, {
        method: 'POST',
        body: JSON.stringify({ content: messageText })
      });

      if (response.ok) {
        // Instantly fetch history
        fetchMessages(activeConvId);
        // Refresh conversation listing order
        fetchConversations();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = usersList.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{
      margin: '0 20px 40px 20px',
      maxWidth: '1200px',
      marginLeft: 'auto',
      marginRight: 'auto',
      height: 'calc(100vh - 140px)',
      display: 'flex',
      gap: '20px'
    }} className="animate-fade-in">
      
      {/* Left Pane: Inbox Listing */}
      <div className="glass-card" style={{
        flex: '0 0 350px',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 'var(--border-radius-md)',
        overflow: 'hidden'
      }}>
        {/* Inbox Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Direct Mail</h3>
          <button 
            className={`btn ${showUsersDirectory ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setShowUsersDirectory(!showUsersDirectory)}
            style={{ padding: '8px 12px', fontSize: '0.8rem', borderRadius: '12px' }}
          >
            <Users size={14} />
            Directory
          </button>
        </div>

        {/* Inbox List */}
        <div style={{ flexGrow: 1, overflowY: 'auto' }}>
          {loadingConvs ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              Loading inbox...
            </div>
          ) : conversations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-muted)' }}>
              <Inbox size={32} style={{ marginBottom: '12px', opacity: '0.4' }} />
              <p style={{ fontSize: '0.9rem' }}>Your inbox is empty</p>
              <button 
                className="btn btn-secondary animate-fade-in"
                onClick={() => setShowUsersDirectory(true)}
                style={{ marginTop: '14px', fontSize: '0.8rem' }}
              >
                Find friends
              </button>
            </div>
          ) : (
            conversations.map((c) => (
              <div 
                key={c.id} 
                onClick={() => handleSelectConversation(c.id)}
                style={{
                  padding: '16px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  cursor: 'pointer',
                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                  background: activeConvId === c.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                  borderLeft: activeConvId === c.id ? '4px solid var(--accent-primary)' : '4px solid transparent',
                  transition: 'var(--transition-smooth)'
                }}
              >
                {/* User Avatar */}
                {c.profile_picture ? (
                  <img src={c.profile_picture} alt={c.username} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'var(--accent-gradient)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    color: 'white'
                  }}>
                    {c.username.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Body details */}
                <div style={{ flexGrow: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                    <h5 style={{ fontWeight: '600', fontSize: '0.95rem', color: 'white' }}>{c.username}</h5>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {c.last_message_time ? c.last_message_time.substring(11, 16) : ''}
                    </span>
                  </div>
                  <p style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap'
                  }}>
                    {c.last_message || 'Start chatting...'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Pane: Active Chat details or Directory */}
      <div className="glass-card" style={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 'var(--border-radius-md)',
        overflow: 'hidden'
      }}>
        {showUsersDirectory ? (
          /* Users Directory Mode */
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }} className="animate-fade-in">
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)' }}>
              <h4 style={{ marginBottom: '14px', fontSize: '1.1rem', fontWeight: '700' }}>Directory - Start Conversation</h4>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search usernames..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                />
                <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            {/* Users grid */}
            <div style={{ padding: '24px', flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filteredUsers.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>
                  No active users match your query
                </div>
              ) : (
                filteredUsers.map((u) => (
                  <div 
                    key={u.id}
                    onClick={() => handleStartNewChat(u)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 18px',
                      borderRadius: 'var(--border-radius-sm)',
                      background: 'rgba(255,255,255,0.01)',
                      border: '1px solid var(--border-color)',
                      cursor: 'pointer',
                      transition: 'var(--transition-smooth)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {u.profile_picture ? (
                        <img src={u.profile_picture} alt={u.username} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: 'var(--accent-gradient)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '700',
                          color: 'white',
                          fontSize: '0.85rem'
                        }}>
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: '600', color: 'white', fontSize: '0.95rem' }}>{u.username}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                      </div>
                    </div>
                    <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                      Message
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : activeConvId ? (
          /* Active Chat Feed Mode */
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }} className="animate-fade-in">
            {/* Header Recipient */}
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'rgba(15, 23, 42, 0.2)'
            }}>
              {activeRecipient?.profile_picture ? (
                <img src={activeRecipient.profile_picture} alt={activeRecipient.username} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'var(--accent-gradient)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  color: 'white'
                }}>
                  {activeRecipient?.username.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'white' }}>{activeRecipient?.username}</h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-success)' }}>● connected</span>
              </div>
            </div>

            {/* Scrollable Message history list */}
            <div style={{
              flexGrow: 1,
              overflowY: 'auto',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              background: 'rgba(8,12,20,0.4)'
            }}>
              {messages.length === 0 ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  No messages yet. Send a greetings message to start chatting!
                </div>
              ) : (
                messages.map((m) => {
                  const isMine = m.sender_id === user.id;
                  return (
                    <div 
                      key={m.id}
                      style={{
                        display: 'flex',
                        justifyContent: isMine ? 'flex-end' : 'flex-start',
                        width: '100%'
                      }}
                    >
                      <div style={{
                        maxWidth: '70%',
                        padding: '12px 18px',
                        borderRadius: isMine ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                        background: isMine ? 'var(--accent-primary)' : 'rgba(255,255,255,0.06)',
                        color: 'white',
                        border: isMine ? 'none' : '1px solid var(--border-color)',
                        boxShadow: isMine ? '0 4px 10px rgba(99,102,241,0.2)' : 'none'
                      }}>
                        <p style={{ fontSize: '0.95rem', lineHeight: '1.45', wordBreak: 'break-word' }}>
                          {m.content}
                        </p>
                        <span style={{
                          display: 'block',
                          fontSize: '0.65rem',
                          color: isMine ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)',
                          marginTop: '6px',
                          textAlign: 'right'
                        }}>
                          {m.sent_at.substring(11, 16)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input footer */}
            <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border-color)', background: 'rgba(15, 23, 42, 0.4)' }}>
              <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Write a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  required
                  style={{ flexGrow: 1 }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px' }}>
                  <Send size={16} />
                  Send
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Empty State */
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            color: 'var(--text-muted)',
            padding: '24px'
          }}>
            <MessageSquare size={48} style={{ opacity: 0.15, marginBottom: '16px' }} />
            <h4 style={{ color: 'white', fontWeight: '700', marginBottom: '6px' }}>Inbox Center</h4>
            <p style={{ fontSize: '0.9rem', textAlign: 'center', maxWidth: '300px' }}>
              Select a conversation from the sidebar list or browse the Directory to start.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
