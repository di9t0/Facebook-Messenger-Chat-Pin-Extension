
// Facebook Messenger Pin Extension - Content Script
// Handles chat detection, pin functionality, and UI integration

class MessengerPinManager {
  constructor() {
    this.pinnedChats = new Set();
    this.chatObserver = null;
    this.chatListContainer = null;
    this.isInitialized = false;

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  async init() {
    console.log('[Pin Extension] Initializing...');

    // Load saved pinned chats from storage
    await this.loadPinnedChats();

    // Wait for messenger to load and find chat containers
    this.waitForMessengerLoad();
  }

  async loadPinnedChats() {
    try {
      const result = await chrome.storage.sync.get(['pinnedChats']);
      this.pinnedChats = new Set(result.pinnedChats || []);
      console.log('[Pin Extension] Loaded pinned chats:', Array.from(this.pinnedChats));
    } catch (error) {
      console.error('[Pin Extension] Error loading pinned chats:', error);
    }
  }

  async savePinnedChats() {
    try {
      await chrome.storage.sync.set({ 
        pinnedChats: Array.from(this.pinnedChats) 
      });
      console.log('[Pin Extension] Saved pinned chats:', Array.from(this.pinnedChats));
    } catch (error) {
      console.error('[Pin Extension] Error saving pinned chats:', error);
    }
  }

  waitForMessengerLoad() {
    const checkInterval = setInterval(() => {
      // Multiple selectors to handle different Facebook layouts
      const chatSelectors = [
        '[role="navigation"] [role="grid"]', // Main chat list grid
        '[data-pagelet="LeftRail"] [role="grid"]', // Left rail grid
        '[aria-label*="Chats"] [role="grid"]', // Chats grid
        'div[data-pagelet="LeftRail"] div[role="grid"]', // Alternative selector
        '.x1n2onr6 [role="grid"]' // Fallback selector
      ];

      for (const selector of chatSelectors) {
        this.chatListContainer = document.querySelector(selector);
        if (this.chatListContainer) {
          console.log('[Pin Extension] Found chat container:', selector);
          clearInterval(checkInterval);
          this.setupChatObserver();
          this.processExistingChats();
          return;
        }
      }

      console.log('[Pin Extension] Still waiting for chat container...');
    }, 1000);

    // Stop trying after 30 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
      if (!this.chatListContainer) {
        console.warn('[Pin Extension] Could not find chat container after 30 seconds');
      }
    }, 30000);
  }

  setupChatObserver() {
    if (this.chatObserver) {
      this.chatObserver.disconnect();
    }

    this.chatObserver = new MutationObserver((mutations) => {
      let shouldProcess = false;

      mutations.forEach(mutation => {
        if (mutation.type === 'childList' && 
            (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0)) {
          shouldProcess = true;
        }
      });

      if (shouldProcess) {
        setTimeout(() => this.processExistingChats(), 500);
      }
    });

    this.chatObserver.observe(this.chatListContainer, {
      childList: true,
      subtree: true
    });

    console.log('[Pin Extension] Chat observer setup complete');
  }

  processExistingChats() {
    if (!this.chatListContainer) return;

    // Find all chat items using multiple selectors
    const chatSelectors = [
      '[role="gridcell"] > div', // Main chat items
      '[role="row"] > div', // Alternative row structure
      'div[data-testid*="chat"]', // Test ID based
      '.x1n2onr6 > div > div', // Fallback structural selector
    ];

    let chatItems = [];
    for (const selector of chatSelectors) {
      chatItems = this.chatListContainer.querySelectorAll(selector);
      if (chatItems.length > 0) {
        console.log(`[Pin Extension] Found ${chatItems.length} chats using selector: ${selector}`);
        break;
      }
    }

    if (chatItems.length === 0) {
      console.log('[Pin Extension] No chat items found');
      return;
    }

    chatItems.forEach(chatItem => this.processChatItem(chatItem));
    this.reorderPinnedChats();
  }

  processChatItem(chatItem) {
    // Skip if already processed
    if (chatItem.querySelector('.pin-chat-btn')) return;

    // Extract chat information
    const chatInfo = this.extractChatInfo(chatItem);
    if (!chatInfo) return;

    // Add pin button
    this.addPinButton(chatItem, chatInfo);
  }

  extractChatInfo(chatItem) {
    // Try to find chat name and ID from various elements
    let chatName = '';
    let chatId = '';

    // Look for text content in various elements
    const textSelectors = [
      '[role="link"] span',
      'span[dir="auto"]',
      'div[dir="auto"]',
      'strong',
      'h3',
      'h4'
    ];

    for (const selector of textSelectors) {
      const element = chatItem.querySelector(selector);
      if (element && element.textContent.trim()) {
        chatName = element.textContent.trim();
        break;
      }
    }

    // Generate a unique ID based on available attributes or content
    const linkElement = chatItem.querySelector('[role="link"]');
    if (linkElement) {
      const href = linkElement.getAttribute('href');
      if (href) {
        chatId = href;
      }
    }

    // Fallback: use chat name as ID if no href found
    if (!chatId && chatName) {
      chatId = 'chat_' + btoa(chatName).replace(/[^a-zA-Z0-9]/g, '');
    }

    if (!chatName || !chatId) {
      console.log('[Pin Extension] Could not extract chat info from:', chatItem);
      return null;
    }

    return { chatName, chatId, element: chatItem };
  }

  addPinButton(chatItem, chatInfo) {
    const isPinned = this.pinnedChats.has(chatInfo.chatId);

    // Create pin button
    const pinButton = document.createElement('button');
    pinButton.className = 'pin-chat-btn';
    pinButton.title = isPinned ? 'Unpin chat' : 'Pin chat';
    pinButton.innerHTML = isPinned ? 
      '<svg viewBox="0 0 16 16" width="16" height="16"><path d="M9.828.122a.5.5 0 0 1 .707 0l4.096 4.096a.5.5 0 0 1 0 .707l-1.414 1.414-3-3-1.415 1.414 3 3L8 11.5l-7-7 .707-.707L8 10.086l3.414-3.414z" fill="currentColor"/></svg>' :
      '<svg viewBox="0 0 16 16" width="16" height="16"><path d="M4.146.146A.5.5 0 0 1 4.5 0h7a.5.5 0 0 1 .5.5c0 .68-.342 1.174-.646 1.479-.126.125-.25.224-.354.298v4.431l.078.048c.203.127.476.314.751.555C12.36 7.775 13 8.527 13 9.5a.5.5 0 0 1-.5.5h-4v4.5c0 .276-.224 1.5-.5 1.5s-.5-1.224-.5-1.5V10h-4a.5.5 0 0 1-.5-.5c0-.973.64-1.725 1.17-2.189A5.921 5.921 0 0 1 5 6.708V2.277a2.77 2.77 0 0 1-.354-.298C4.342 1.674 4 1.179 4 .5a.5.5 0 0 1 .146-.354z" fill="currentColor"/></svg>';

    pinButton.setAttribute('data-chat-id', chatInfo.chatId);

    if (isPinned) {
      pinButton.classList.add('pinned');
      chatItem.classList.add('pinned-chat');
    }

    // Add click handler
    pinButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.togglePin(chatInfo.chatId, chatItem, pinButton);
    });

    // Find the best place to insert the button (usually top-right of chat item)
    const insertTarget = chatItem.querySelector('[role="link"]') || chatItem;
    if (insertTarget) {
      insertTarget.style.position = 'relative';
      insertTarget.appendChild(pinButton);
    }

    console.log('[Pin Extension] Added pin button for:', chatInfo.chatName);
  }

  async togglePin(chatId, chatElement, buttonElement) {
    const wasPinned = this.pinnedChats.has(chatId);

    if (wasPinned) {
      this.pinnedChats.delete(chatId);
      buttonElement.classList.remove('pinned');
      chatElement.classList.remove('pinned-chat');
      buttonElement.title = 'Pin chat';
      buttonElement.innerHTML = '<svg viewBox="0 0 16 16" width="16" height="16"><path d="M4.146.146A.5.5 0 0 1 4.5 0h7a.5.5 0 0 1 .5.5c0 .68-.342 1.174-.646 1.479-.126.125-.25.224-.354.298v4.431l.078.048c.203.127.476.314.751.555C12.36 7.775 13 8.527 13 9.5a.5.5 0 0 1-.5.5h-4v4.5c0 .276-.224 1.5-.5 1.5s-.5-1.224-.5-1.5V10h-4a.5.5 0 0 1-.5-.5c0-.973.64-1.725 1.17-2.189A5.921 5.921 0 0 1 5 6.708V2.277a2.77 2.77 0 0 1-.354-.298C4.342 1.674 4 1.179 4 .5a.5.5 0 0 1 .146-.354z" fill="currentColor"/></svg>';
    } else {
      this.pinnedChats.add(chatId);
      buttonElement.classList.add('pinned');
      chatElement.classList.add('pinned-chat');
      buttonElement.title = 'Unpin chat';
      buttonElement.innerHTML = '<svg viewBox="0 0 16 16" width="16" height="16"><path d="M9.828.122a.5.5 0 0 1 .707 0l4.096 4.096a.5.5 0 0 1 0 .707l-1.414 1.414-3-3-1.415 1.414 3 3L8 11.5l-7-7 .707-.707L8 10.086l3.414-3.414z" fill="currentColor"/></svg>';
    }

    await this.savePinnedChats();
    setTimeout(() => this.reorderPinnedChats(), 100);

    console.log(`[Pin Extension] ${wasPinned ? 'Unpinned' : 'Pinned'} chat:`, chatId);
  }

  reorderPinnedChats() {
    if (!this.chatListContainer) return;

    const pinnedElements = [];
    const unpinnedElements = [];

    // Collect all chat items and categorize them
    const chatItems = this.chatListContainer.querySelectorAll('[role="gridcell"], [role="row"]');

    chatItems.forEach(item => {
      const pinButton = item.querySelector('.pin-chat-btn');
      if (pinButton) {
        const chatId = pinButton.getAttribute('data-chat-id');
        if (this.pinnedChats.has(chatId)) {
          pinnedElements.push(item);
        } else {
          unpinnedElements.push(item);
        }
      } else {
        unpinnedElements.push(item);
      }
    });

    // Reorder: pinned chats first, then unpinned
    const parent = chatItems[0]?.parentNode;
    if (parent) {
      // Remove all items
      chatItems.forEach(item => {
        if (item.parentNode === parent) {
          parent.removeChild(item);
        }
      });

      // Add back in order: pinned first
      pinnedElements.forEach(item => parent.appendChild(item));
      unpinnedElements.forEach(item => parent.appendChild(item));

      console.log(`[Pin Extension] Reordered chats: ${pinnedElements.length} pinned, ${unpinnedElements.length} unpinned`);
    }
  }

  // Clean up when page changes
  destroy() {
    if (this.chatObserver) {
      this.chatObserver.disconnect();
    }
  }
}

// Initialize the extension
let pinManager;

// Handle both initial load and navigation changes
function initializeExtension() {
  if (pinManager) {
    pinManager.destroy();
  }

  // Only initialize on messenger pages
  if (window.location.pathname.includes('/messages')) {
    pinManager = new MessengerPinManager();
  }
}

// Initialize immediately
initializeExtension();

// Listen for navigation changes (SPA)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    setTimeout(initializeExtension, 1000);
  }
}).observe(document, { subtree: true, childList: true });

console.log('[Pin Extension] Content script loaded');
