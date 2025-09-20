# 📌 Facebook Messenger Pin Extension

**Keep your important Facebook Messenger chats always at the top!**  
A lightweight Chrome extension that lets you pin and organize chats for faster access and a cleaner interface.

---

## ✨ Features

- **Pin/Unpin Chats** – Easily pin any chat to the top of your chat list.  
- **Persistent Storage** – Pinned chats are saved across browser sessions.  
- **Auto-Reordering** – Pinned chats automatically stay on top.  
- **Dynamic Loading Support** – Works seamlessly with Facebook’s dynamic chat interface.  
- **Extension Popup** – Manage all your pinned chats in one place.  
- **Dark/Light Mode Compatible** – Fully adapts to Facebook’s theme.  

---

## 🛠️ Installation

### Method 1: Chrome Web Store (Future Release)
*Note: Not yet published to the Chrome Web Store.*

### Method 2: Load Unpacked Extension (Developer Mode)

1. **Download the Extension**
   - Download all files to a folder on your computer.  
   - Folder structure should include:
     ```
     messenger-pin-extension/
     ├── manifest.json
     ├── content.js
     ├── background.js
     ├── styles.css
     ├── popup.html
     └── popup.js
     ```

2. **Enable Developer Mode**
   - Open Chrome → `chrome://extensions/`  
   - Toggle **Developer mode** (top-right corner).

3. **Load the Extension**
   - Click **Load unpacked** → select your folder.  

4. **Verify**
   - Visit `facebook.com/messages` and hover over chats to see pin buttons.  

---

## 🎯 How to Use

### Pinning Chats
1. Open Facebook Messenger in Chrome.  
2. Hover over any chat → click the **pin button**.  
3. The chat moves to the top and stays pinned.  
4. Click the pin again to unpin.  

### Managing Pins
- Use the extension popup to view pinned chats, toggle the extension, or clear all pins.  
- Keyboard shortcuts:
  - `Ctrl/Cmd + R` → Refresh popup data  
  - `Escape` → Close popup  

---

## ⚡ Why Use This Extension

- ✅ **Stay Organized** – Keep important chats accessible.  
- ✅ **Save Time** – Avoid scrolling through endless messages.  
- ✅ **Distraction-Free** – Focus on what matters most.  
- ✅ **Lightweight & Fast** – Minimal impact on browser performance.  

---

## 🛠️ Technical Details

- **Browser Support** – Chrome 88+ and other Chromium-based browsers.  
- **Storage** – Uses Chrome Storage API for pinned chat persistence.  
- **Dynamic UI** – Uses MutationObserver to track chat list changes in real-time.  
- **Privacy** – All data is stored locally; no external servers, no data collection.  

---

## 💡 Troubleshooting

- **Pin buttons not appearing?**  
  - Refresh Messenger, check extension status, or clear browser cache.  

- **Chats not staying pinned?**  
  - Make sure Chrome storage permissions are granted and sync is enabled.  

- **Interface breaks after Facebook update?**  
  - Report the issue or wait for extension update.  

---

## 🔧 Contributing

- Add new features (sorting, categories, shortcuts)  
- Improve performance and UI  
- Report bugs and suggest improvements  

*Fork → modify → submit a pull request.*  

---

## 📜 License

MIT License – free to use, modify, and share.  

---

**Made with ❤️ for users who want a cleaner, smarter Messenger experience**
