# 🐦 X 4 U - A Twitter Declutter Extension

## ✨ Features

### 🚫 **Remove Premium Ads**
- Removes "Subscribe to Premium" prompts from the sidebar
- Hides the Premium tab
- Eliminates profile Premium ads within profiles

### 🤖 **Remove Grok**
- Removes the Grok AI assistant from the sidebar
- Hides Grok-related buttons and features on profiles and posts
- Cleans up Grok action buttons

### 🧹 **Remove Sidebar Clutter**
- Removes Lists, Jobs, Communities, and Verified Orgs from the sidebar
- Keeps your navigation clean and focused on essential features

### 👥 **Remove Who to Follow**
- Eliminates follow suggestions from your feed
- Removes "Who to follow" sections on profile pages

### 📊 **Remove What's Happening**
- Removes the "What's happening" sidebar content

### 📱 **Remove Profile Features**
- Removes the "Highlights" tab from profiles
- Hides the "Articles" tab from profiles

### 🐦 **Give 'em the bird!**
- Replaces X branding with the original Twitter bird logo
- Changes "Post" buttons back to "Tweet"

## 🚀 Installation

### From Source
1. Clone this repository:
   ```bash
   git clone https://github.com/nathant7/twitter-declutter.git
   cd twitter-declutter
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" in the top right

4. Click "Load unpacked" and select the project folder

5. The extension will now be installed and ready to use!

### From Chrome Web Store
*Coming soon!*

## 🎯 Usage

1. **Navigate to Twitter/X** - The extension works on `twitter.com` and `x.com`

2. **Click the extension icon** - Located in your Chrome toolbar

3. **Toggle features on/off** - Use the simple interface to enable/disable features

4. **Enjoy a cleaner experience** - Changes apply instantly across the site

## 🛠️ Technical Details

### Architecture
- **Modular Design**: Each feature is implemented as a separate class for maintainability
- **Settings Management**: Persistent storage using Chrome's local storage API
- **Dynamic Content**: MutationObserver handles Twitter's dynamic content loading
- **Performance Optimized**: Debounced observers prevent excessive processing

### Key Components
- `SettingsManager` - Handles extension settings and persistence
- `PremiumRemover` - Removes premium ads and verification prompts
- `GrokRemover` - Eliminates Grok AI features
- `SidebarClutterRemover` - Cleans up sidebar navigation
- `WhoToFollowRemover` - Removes follow suggestions
- `WhatsHappeningRemover` - Hides trending topics
- `ProfileFeaturesRemover` - Removes profile-specific features
- `TwitterBirdRestorer` - Restores classic Twitter branding

### Browser Support
- ✅ Chrome
- ✅ Edge (Chromium-based)
- ✅ Brave <- I like this one!
- ✅ Other Chromium-based browsers

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


## 💖 Support

If you find this extension helpful, consider:

- ⭐ **Starring the repository**
- 🐛 **Reporting bugs** or suggesting features
- ☕ **Buying me a coffee** on [Ko-Fi](https://ko-fi.com/nathant7) (doesn't work yet!)
- 🔗 **Sharing with friends** who might find it useful


**Thank you!!!**
