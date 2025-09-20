
// Facebook Messenger Pin Extension - Background Service Worker
// Handles extension lifecycle and storage management

class BackgroundManager {
  constructor() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Handle extension installation
    chrome.runtime.onInstalled.addListener((details) => {
      console.log('[Pin Extension] Extension installed:', details);

      if (details.reason === 'install') {
        this.handleInstall();
      } else if (details.reason === 'update') {
        this.handleUpdate(details.previousVersion);
      }
    });

    // Handle extension startup
    chrome.runtime.onStartup.addListener(() => {
      console.log('[Pin Extension] Extension started');
      this.handleStartup();
    });

    // Handle messages from content script or popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep the message channel open for async responses
    });

    // Handle storage changes
    chrome.storage.onChanged.addListener((changes, areaName) => {
      this.handleStorageChange(changes, areaName);
    });

    // Handle tab updates to inject content script if needed
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && this.isMessengerUrl(tab.url)) {
        this.handleMessengerTabUpdate(tabId, tab);
      }
    });
  }

  handleInstall() {
    console.log('[Pin Extension] First time installation');

    // Initialize default settings
    chrome.storage.sync.set({
      pinnedChats: [],
      extensionEnabled: true,
      version: '1.0.0'
    });

    // Open welcome page or instructions
    chrome.tabs.create({
      url: 'https://facebook.com/messages',
      active: true
    });
  }

  handleUpdate(previousVersion) {
    console.log(`[Pin Extension] Updated from version ${previousVersion}`);

    // Handle version-specific migration if needed
    this.migratePinnedChats(previousVersion);
  }

  handleStartup() {
    console.log('[Pin Extension] Browser started, extension active');
  }

  async handleMessage(message, sender, sendResponse) {
    try {
      switch (message.type) {
        case 'GET_PINNED_CHATS':
          const result = await chrome.storage.sync.get(['pinnedChats']);
          sendResponse({ pinnedChats: result.pinnedChats || [] });
          break;

        case 'SET_PINNED_CHATS':
          await chrome.storage.sync.set({ pinnedChats: message.chats });
          sendResponse({ success: true });
          break;

        case 'TOGGLE_PIN':
          await this.toggleChatPin(message.chatId);
          sendResponse({ success: true });
          break;

        case 'GET_EXTENSION_STATUS':
          const status = await chrome.storage.sync.get(['extensionEnabled']);
          sendResponse({ enabled: status.extensionEnabled !== false });
          break;

        case 'TOGGLE_EXTENSION':
          const currentStatus = await chrome.storage.sync.get(['extensionEnabled']);
          const newStatus = !currentStatus.extensionEnabled;
          await chrome.storage.sync.set({ extensionEnabled: newStatus });
          sendResponse({ enabled: newStatus });
          break;

        default:
          console.warn('[Pin Extension] Unknown message type:', message.type);
          sendResponse({ error: 'Unknown message type' });
      }
    } catch (error) {
      console.error('[Pin Extension] Error handling message:', error);
      sendResponse({ error: error.message });
    }
  }

  handleStorageChange(changes, areaName) {
    if (areaName === 'sync' && changes.pinnedChats) {
      console.log('[Pin Extension] Pinned chats updated:', changes.pinnedChats);

      // Notify all messenger tabs about the change
      this.notifyMessengerTabs({
        type: 'PINNED_CHATS_UPDATED',
        pinnedChats: changes.pinnedChats.newValue || []
      });
    }
  }

  async handleMessengerTabUpdate(tabId, tab) {
    try {
      // Check if extension is enabled
      const status = await chrome.storage.sync.get(['extensionEnabled']);
      if (status.extensionEnabled === false) {
        return;
      }

      console.log('[Pin Extension] Messenger tab updated:', tab.url);

      // Inject content script if not already present
      chrome.tabs.sendMessage(tabId, { type: 'PING' }, (response) => {
        if (chrome.runtime.lastError) {
          // Content script not present, inject it
          console.log('[Pin Extension] Injecting content script into tab:', tabId);
          chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
          });
        }
      });
    } catch (error) {
      console.error('[Pin Extension] Error handling messenger tab update:', error);
    }
  }

  async toggleChatPin(chatId) {
    try {
      const result = await chrome.storage.sync.get(['pinnedChats']);
      const pinnedChats = new Set(result.pinnedChats || []);

      if (pinnedChats.has(chatId)) {
        pinnedChats.delete(chatId);
        console.log('[Pin Extension] Unpinned chat:', chatId);
      } else {
        pinnedChats.add(chatId);
        console.log('[Pin Extension] Pinned chat:', chatId);
      }

      await chrome.storage.sync.set({ pinnedChats: Array.from(pinnedChats) });

      return { success: true, isPinned: pinnedChats.has(chatId) };
    } catch (error) {
      console.error('[Pin Extension] Error toggling chat pin:', error);
      throw error;
    }
  }

  async notifyMessengerTabs(message) {
    try {
      const tabs = await chrome.tabs.query({ 
        url: ["*://www.facebook.com/messages*", "*://facebook.com/messages*"] 
      });

      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, message).catch(err => {
          // Ignore errors for tabs that don't have the content script
          console.log('[Pin Extension] Could not send message to tab:', tab.id);
        });
      });
    } catch (error) {
      console.error('[Pin Extension] Error notifying messenger tabs:', error);
    }
  }

  isMessengerUrl(url) {
    return url && (
      url.includes('facebook.com/messages') || 
      url.includes('www.facebook.com/messages')
    );
  }

  async migratePinnedChats(fromVersion) {
    // Handle data migration between versions if needed
    console.log(`[Pin Extension] Migrating data from version ${fromVersion}`);

    // Example migration logic (if needed in future versions)
    if (fromVersion < '1.0.0') {
      // Perform migration
      const result = await chrome.storage.local.get(['pinnedChats']);
      if (result.pinnedChats) {
        await chrome.storage.sync.set({ pinnedChats: result.pinnedChats });
        await chrome.storage.local.remove(['pinnedChats']);
        console.log('[Pin Extension] Migrated pinned chats to sync storage');
      }
    }
  }

  // Utility method to get extension statistics
  async getExtensionStats() {
    try {
      const result = await chrome.storage.sync.get(['pinnedChats']);
      const pinnedChats = result.pinnedChats || [];

      return {
        totalPinnedChats: pinnedChats.length,
        pinnedChatIds: pinnedChats,
        version: chrome.runtime.getManifest().version
      };
    } catch (error) {
      console.error('[Pin Extension] Error getting extension stats:', error);
      return null;
    }
  }
}

// Initialize the background manager
const backgroundManager = new BackgroundManager();

// Export for testing or debugging
self.backgroundManager = backgroundManager;

console.log('[Pin Extension] Background script loaded');
