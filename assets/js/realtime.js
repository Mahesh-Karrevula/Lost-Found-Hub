document.addEventListener('DOMContentLoaded', function() {
    // Real-time notification updates
    if (typeof userId !== 'undefined') {
        checkNotifications();
        setInterval(checkNotifications, 30000); // Check every 30 seconds
    }

    // Real-time messaging
    if (typeof chatId !== 'undefined') {
        loadMessages();
        setInterval(loadMessages, 5000); // Check for new messages every 5 seconds
    }
});

// Check for new notifications
function checkNotifications() {
    fetch(`${baseUrl}api/notifications/unread-count`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.count > 0) {
                updateNotificationBadge(data.count);
                
                // Show toast for new notifications
                if (data.count > currentUnreadCount) {
                    showNewNotificationsToast(data.count);
                }
                currentUnreadCount = data.count;
            }
        })
        .catch(error => console.error('Error checking notifications:', error));
}

// Update notification badge
function updateNotificationBadge(count) {
    const badge = document.getElementById('notification-badge');
    if (badge) {
        badge.textContent = count;
        badge.classList.toggle('d-none', count === 0);
    }
}

// Show new notifications toast
function showNewNotificationsToast(count) {
    const toast = new bootstrap.Toast(document.getElementById('new-notification-toast'));
    const toastMessage = document.getElementById('toast-message');
    
    toastMessage.textContent = `You have ${count} new notification${count > 1 ? 's' : ''}`;
    toast.show();
}

// Load messages for chat
function loadMessages() {
    const chatContainer = document.getElementById('chat-messages');
    if (!chatContainer) return;

    const lastMessageId = chatContainer.dataset.lastMessageId || 0;
    
    fetch(`${baseUrl}api/messages/chat/${chatId}?last_id=${lastMessageId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.messages.length > 0) {
                appendNewMessages(data.messages);
                
                // Mark messages as read
                if (data.messages.some(msg => !msg.is_read && msg.receiver_id == userId)) {
                    markMessagesAsRead(data.messages.filter(msg => !msg.is_read && msg.receiver_id == userId).map(msg => msg.message_id));
                }
            }
        })
        .catch(error => console.error('Error loading messages:', error));
}

// Append new messages to chat
function appendNewMessages(messages) {
    const chatContainer = document.getElementById('chat-messages');
    const isScrolledToBottom = chatContainer.scrollTop + chatContainer.clientHeight >= chatContainer.scrollHeight - 50;
    
    messages.forEach(message => {
        const messageElement = createMessageElement(message);
        chatContainer.appendChild(messageElement);
    });
    
    // Update last message ID
    if (messages.length > 0) {
        chatContainer.dataset.lastMessageId = messages[messages.length - 1].message_id;
    }
    
    // Auto-scroll to bottom if already near bottom
    if (isScrolledToBottom) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
}

// Create message element
function createMessageElement(message) {
    const isCurrentUser = message.sender_id == userId;
    const messageTime = new Date(message.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `d-flex mb-3 ${isCurrentUser ? 'justify-content-end' : 'justify-content-start'}`;
    
    messageDiv.innerHTML = `
        <div class="${isCurrentUser ? 'bg-primary text-white' : 'bg-light'} rounded-3 p-3 max-w-75">
            <div class="message-content">${escapeHtml(message.content)}</div>
            <div class="text-end small ${isCurrentUser ? 'text-white-50' : 'text-muted'}">${messageTime}</div>
        </div>
    `;
    
    return messageDiv;
}

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}