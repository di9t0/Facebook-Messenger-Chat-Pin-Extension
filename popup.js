
// Facebook Messenger Pin Extension - Popup Script
// Handles the extension popup interface and user interactions

class PopupManager {
  constructor() {
    this.pinnedChats = [];
    this.extensionEnabled = true;
    this.init();
  }

  init() {
    this.showLoading(true);
    this.setupEventListeners();
    this.loadData();
  }

  setupEventListeners() {
    // Extension toggle
    const extensionToggle = document.getElementById('extensionToggle');
    extensionToggle.addEventListener('click', () => this.toggleExtension());

    // Action buttons
    document.getElementById('refreshBtn').addEventListener('click', () => this.refreshData());
    document.getElementById('clearAllBtn').addEventListener('click', () => this.clearAllPins());
    document.getElementById('openMessengerBtn').addEventListener('click', () => this.openMessenger());

    // Footer links
    document.getElementById('helpLink').addEventListener('click', (e) => {
      e.preventDefault();
      this.showHelp();
    });

    document.getElementById('feedbackLink').addEventListener('click', (e) => {
      e.preventDefault();
      this.showFeedback();
    });
  }

  async loadData() {
    try {
      // Load extension status and pinned chats
      const [statusResult, pinnedResult] = await Promise.all([
        chrome.runtime.sendMessage({ type: 'GET_EXTENSION_STATUS' }),
        chrome.runtime.sendMessage({ type: 'GET_PINNED_CHATS' })
      ]);

      this.extensionEnabled = statusResult.enabled;
      this.pinnedChats = pinnedResult.pinnedChats || [];

      this.updateUI();
      this.showLoading(false);
      this.showContent(true);
    } catch (error) {
      console.error('[Pin Extension] Error loading data:', error);
      this.showError('Failed to load extension data. Please try again.');
    }
  }

  async toggleExtension() {
    try {
      const result = await chrome.runtime.sendMessage({ type: 'TOGGLE_EXTENSION' });
      this.extensionEnabled = result.enabled;
      this.updateUI();

      // Show notification
      this.showNotification(
        this.extensionEnabled ? 'Extension enabled' : 'Extension disabled'
      );
    } catch (error) {
      console.error('[Pin Extension] Error toggling extension:', error);
      this.showError('Failed to toggle extension status.');
    }
  }

  async refreshData() {
    const refreshBtn = document.getElementById('refreshBtn');
    const originalText = refreshBtn.textContent;

    refreshBtn.textContent = 'Refreshing...';
    refreshBtn.disabled = true;

    try {
      await this.loadData();
      this.showNotification('Data refreshed successfully');
    } catch (error) {
      this.showError('Failed to refresh data.');
    } finally {
      refreshBtn.textContent = originalText;
      refreshBtn.disabled = false;
    }
  }

  async clearAllPins() {
    if (this.pinnedChats.length === 0) {
      this.showNotification('No pinned chats to clear');
      return;
    }

    if (confirm(`Clear all ${this.pinnedChats.length} pinned chats?`)) {
      try {
        await chrome.runtime.sendMessage({ 
          type: 'SET_PINNED_CHATS', 
          chats: [] 
        });

        this.pinnedChats = [];
        this.updateUI();
        this.showNotification('All pins cleared successfully');
      } catch (error) {
        console.error('[Pin Extension] Error clearing pins:', error);
        this.showError('Failed to clear pinned chats.');
      }
    }
  }

  openMessenger() {
    chrome.tabs.create({
      url: 'https://www.facebook.com/messages',
      active: true
    });

    // Close popup after opening messenger
    window.close();
  }

  updateUI() {
    // Update extension toggle
    const extensionToggle = document.getElementById('extensionToggle');
    const extensionStatus = document.getElementById('extensionStatus');

    if (this.extensionEnabled) {
      extensionToggle.classList.add('active');
      extensionStatus.textContent = 'Active';
      extensionStatus.style.color = '#42b883';
    } else {
      extensionToggle.classList.remove('active');
      extensionStatus.textContent = 'Disabled';
      extensionStatus.style.color = '#e74c3c';
    }

    // Update pinned count
    document.getElementById('pinnedCount').textContent = this.pinnedChats.length;

    // Update extension version
    const manifest = chrome.runtime.getManifest();
    document.getElementById('extensionVersion').textContent = manifest.version;

    // Update pinned chats list
    this.updatePinnedChatsList();
  }

  updatePinnedChatsList() {
    const pinnedChatsList = document.getElementById('pinnedChatsList');

    if (this.pinnedChats.length === 0) {
      pinnedChatsList.innerHTML = '<div class="no-pinned-chats">No chats pinned yet</div>';
      return;
    }

    const chatItems = this.pinnedChats.map((chatId, index) => {
      // Extract chat name from ID (simplified)
      const chatName = this.extractChatNameFromId(chatId);
      return `
        <div class="pinned-chat-item" title="${chatId}">
          ${chatName || `Chat ${index + 1}`}
        </div>
      `;
    }).join('');

    pinnedChatsList.innerHTML = chatItems;
  }

  extractChatNameFromId(chatId) {
    // Try to extract meaningful name from chat ID
    try {
      if (chatId.startsWith('chat_')) {
        // Base64 encoded name
        const encoded = chatId.substring(5);
        return atob(encoded);
      } else if (chatId.includes('/messages/t/')) {
        // URL-based ID
        return 'Group Chat';
      } else if (chatId.includes('/messages/')) {
        return 'Direct Chat';
      }
    } catch (error) {
      // Ignore decoding errors
    }

    // Fallback: show truncated ID
    return chatId.length > 20 ? chatId.substring(0, 20) + '...' : chatId;
  }

  showLoading(show) {
    const loading = document.getElementById('loading');
    if (show) {
      loading.classList.add('show');
    } else {
      loading.classList.remove('show');
    }
  }

  showContent(show) {
    const content = document.getElementById('content');
    content.style.display = show ? 'block' : 'none';
  }

  showError(message) {
    const error = document.getElementById('error');
    const errorMessage = document.getElementById('error-message');

    errorMessage.textContent = message;
    error.classList.add('show');

    // Auto-hide after 5 seconds
    setTimeout(() => {
      error.classList.remove('show');
    }, 5000);
  }

  showNotification(message) {
    // Simple notification using browser's notification API
    // This could be enhanced with a custom notification UI
    console.log(`[Pin Extension] Notification: ${message}`);

    // Show temporary visual feedback
    const header = document.querySelector('.header p');
    const originalText = header.textContent;
    header.textContent = message;
    header.style.color = '#4caf50';

    setTimeout(() => {
      header.textContent = originalText;
      header.style.color = '';
    }, 2000);
  }

  showHelp() {
    const helpContent = `
How to use the Facebook Messenger Pin Extension:

1. Visit facebook.com/messages in your browser
2. Look for the pin button (📌) that appears on each chat
3. Click the pin button to pin/unpin chats
4. Pinned chats will automatically move to the top of your chat list
5. Your pinned chats are saved and will persist across browser sessions

Tips:
• Hover over chats to see the pin buttons
• Pinned chats have a blue highlight
• Use this popup to manage all your pins at once
• Toggle the extension on/off using the switch above

Need more help? The extension works automatically on Facebook Messenger web.
    `;

    alert(helpContent);
  }

  showFeedback() {
    const feedbackContent = `
We'd love your feedback on the Pin Extension!

Please report any issues or suggestions:

• Extension not working on certain pages
• Pin buttons not appearing
• Chats not staying pinned
• UI/UX improvements
• New feature requests

You can provide feedback through:
• Browser extension store reviews
• GitHub issues (if open source)
• Direct feedback to developers

Thank you for using the Pin Extension!
    `;

    alert(feedbackContent);
  }

  // Utility method to format chat names
  formatChatName(chatId) {
    const name = this.extractChatNameFromId(chatId);
    return name.length > 30 ? name.substring(0, 30) + '...' : name;
  }

  // Handle keyboard shortcuts
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + R for refresh
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        this.refreshData();
      }

      // Escape to close popup
      if (e.key === 'Escape') {
        window.close();
      }
    });
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});

// Handle popup close/minimize
window.addEventListener('beforeunload', () => {
  console.log('[Pin Extension] Popup closing');
});

console.log('[Pin Extension] Popup script loaded');
