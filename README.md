# Facebook Messenger Pin Extension

A Chrome browser extension that allows you to pin important chats in Facebook Messenger web, keeping them at the top of your chat list.

## Features

✅ **Pin/Unpin Chats**: Click the pin button on any chat to pin it to the top of your chat list  
✅ **Persistent Storage**: Pinned chats are saved and persist across browser sessions  
✅ **Visual Indicators**: Pinned chats have a blue highlight and pin icon  
✅ **Auto-Reordering**: Pinned chats automatically move to the top of the list  
✅ **Dynamic Loading**: Works with Facebook's dynamic chat loading  
✅ **Extension Popup**: Manage all your pins from the extension popup  
✅ **Dark Mode Support**: Adapts to Facebook's dark/light theme  

## Installation

### Method 1: Chrome Web Store (Recommended)
*Note: This extension is not yet published to the Chrome Web Store*

### Method 2: Load Unpacked Extension (Developer Mode)

1. **Download the Extension**
   - Download all files to a folder on your computer
   - Ensure you have all these files:
     ```
     messenger-pin-extension/
     ├── manifest.json
     ├── content.js
     ├── background.js
     ├── styles.css
     ├── popup.html
     ├── popup.js
     ```

2. **Enable Developer Mode in Chrome**
   - Open Chrome browser
   - Go to `chrome://extensions/`
   - Toggle "Developer mode" in the top-right corner

3. **Load the Extension**
   - Click "Load unpacked" button
   - Select the `messenger-pin-extension` folder
   - The extension should appear in your extensions list

4. **Verify Installation**
   - Look for the pin icon (📌) in your Chrome toolbar
   - Visit `facebook.com/messages` to see the pin buttons on chats

## How to Use

### Pinning Chats

1. **Go to Facebook Messenger**
   - Open `facebook.com/messages` in Chrome
   - Make sure you're logged into your Facebook account

2. **Find the Pin Buttons**
   - Hover over any chat in your chat list
   - You'll see a small pin button (📌) appear in the top-right corner of each chat

3. **Pin a Chat**
   - Click the pin button to pin the chat
   - The button will turn blue and the chat will move to the top
   - Pinned chats have a blue highlight on the left side

4. **Unpin a Chat**
   - Click the blue pin button on a pinned chat to unpin it
   - The chat will return to its original position in the list

### Managing Pins

**Using the Extension Popup:**
1. Click the pin icon (📌) in your Chrome toolbar
2. View statistics about your pinned chats
3. Toggle the extension on/off
4. Clear all pins at once
5. Open Facebook Messenger directly

**Keyboard Shortcuts in Popup:**
- `Ctrl/Cmd + R`: Refresh data
- `Escape`: Close popup

## Troubleshooting

### Pin Buttons Not Appearing
- **Check Extension Status**: Make sure the extension is enabled in `chrome://extensions/`
- **Refresh the Page**: Try refreshing Facebook Messenger
- **Clear Cache**: Clear your browser cache and cookies for Facebook
- **Check Console**: Open Developer Tools (F12) and look for any error messages

### Chats Not Staying Pinned
- **Storage Permissions**: Ensure the extension has storage permissions
- **Sync Issues**: Check if Chrome sync is working properly
- **Extension Update**: Try disabling and re-enabling the extension

### Facebook Layout Changes
- **Facebook Updates**: Facebook occasionally changes its layout, which may break the extension
- **Extension Updates**: Check for extension updates or report issues

## Technical Details

### Compatibility
- **Browser**: Chrome 88+ (Manifest V3 compatible)
- **Website**: facebook.com/messages, www.facebook.com/messages
- **Facebook Layout**: Works with current Facebook Messenger web interface

### Permissions Explained
- **Storage**: Saves your pinned chats list
- **Active Tab**: Interacts with Facebook Messenger tabs
- **Host Permissions**: Access to facebook.com and www.facebook.com

### Privacy & Security
- **No Data Collection**: This extension does not collect or transmit any personal data
- **Local Storage Only**: All pinned chat data is stored locally in your browser
- **No External Servers**: No data is sent to external servers
- **Open Source**: Code is transparent and auditable

## Development

### File Structure
```
messenger-pin-extension/
├── manifest.json          # Extension configuration
├── content.js            # Main functionality script
├── background.js         # Service worker
├── styles.css           # Pin button styling
├── popup.html           # Extension popup interface
├── popup.js             # Popup functionality
└── icons/               # Extension icons
    ├── pin-16.png
    ├── pin-32.png
    ├── pin-48.png
    └── pin-128.png
```

### Key Features Implementation
- **Chat Detection**: Uses multiple CSS selectors to find chat elements
- **Dynamic Monitoring**: MutationObserver tracks chat list changes
- **Storage Management**: Chrome Storage API for persistence
- **UI Integration**: Non-intrusive pin buttons with Facebook's design language
- **Error Handling**: Comprehensive error handling and recovery

### Browser Support
- Chrome 88+ (Manifest V3)
- Chromium-based browsers (Edge, Brave, etc.)

## FAQ

**Q: Does this work with Facebook Messenger mobile app?**  
A: No, this is a browser extension that only works with Facebook Messenger web interface.

**Q: Will my pinned chats sync across devices?**  
A: Yes, if you have Chrome sync enabled, your pinned chats will sync across devices.

**Q: Does this affect Facebook's performance?**  
A: No, the extension is designed to be lightweight and non-intrusive.

**Q: What happens if Facebook updates their interface?**  
A: The extension may need updates to work with layout changes. Report issues if buttons stop appearing.

**Q: Can I pin group chats and direct messages?**  
A: Yes, you can pin both group chats and direct message conversations.

## Support

### Reporting Issues
If you encounter problems:

1. **Check Console**: Open Developer Tools (F12) and look for errors
2. **Try Basic Troubleshooting**: Refresh page, restart browser, disable/enable extension
3. **Provide Details**: Include your Chrome version, Facebook interface language, and error messages

### Feature Requests
Suggestions for new features are welcome:
- Multiple pin categories
- Pin sorting options
- Keyboard shortcuts for pinning
- Export/import pin lists

## Changelog

### Version 1.0.0
- Initial release
- Basic pin/unpin functionality
- Persistent storage
- Extension popup interface
- Multiple Facebook layout support
- Dark mode compatibility

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

This extension is not affiliated with, endorsed by, or sponsored by Facebook/Meta. Facebook Messenger is a trademark of Meta Platforms, Inc.

---

**Made with ❤️ for Facebook Messenger users who want better chat organization**
