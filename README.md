# 🐦 X+ // A Twitter Declutter Extension

Now available on the [Chrome Web Store!](https://chromewebstore.google.com/detail/x-4-u/mhacmebldfeefobhodmfmdmhmgidpegc)

## ✨ Features

###  **Remove Premium Ads**
- Removes the full "Subscribe to Premium" card from the sidebar
- Hides the Premium tab
- Eliminates profile Premium ads within profiles

###  **Remove Grok**
- Removes the Grok AI assistant from the sidebar
- Hides Grok-related buttons and features on profiles and posts
- Cleans up Grok action buttons

###  **Remove Sidebar Clutter**
- Choose which native sidebar navigation items to show or hide, and reorder visible items
- Items removed by another active feature appear as unavailable in Hidden and return to their saved position when that feature is disabled
- Restore default navigation returns items to their original order and unhides manually hidden items, while respecting other active removal features
- Leaves X's original controls and More menu in place, preserving their labels, hover effects, and active icon states

###  **Remove Who to Follow**
- Eliminates follow suggestions from your feed
- Removes "Who to follow" sections on profile pages

###  **Remove What's Happening**
- Removes the "What's happening" sidebar content

###  **Give 'em the bird!**
- Replaces X branding with the original Twitter bird logo
- Changes "Post" buttons back to "Tweet"

## 🚀 Installation

### From Source
1. Clone this repository:
   ```bash
   git clone https://github.com/nathant7/twitter-declutter.git
   ```

2. In Chrome, navigate to `chrome://extensions/`. In Firefox, navigate to `about:debugging#/runtime/this-firefox`.

3. In Chrome, enable "Developer mode" in the top right. In Firefox, click "Load Temporary Add-on..."

4. In Chrome, click "Load unpacked" and select the project folder. In Firefox, select the `manifest.json` file in the project folder.

5. The extension will now be installed and ready to use!

Firefox temporary add-ons are removed when Firefox closes. Permanent Firefox installation requires a Mozilla-signed release.

### From Chrome Web Store
[Click me](https://chromewebstore.google.com/detail/x-4-u/mhacmebldfeefobhodmfmdmhmgidpegc) and please consider leaving a nice review I would very much appreciate it! :)

## 🎯 Usage

1. **Navigate to Twitter/X** - The extension works on `twitter.com` and `x.com`

2. **Click the extension icon** - Located in your Chrome toolbar

3. **Toggle features on/off** - Use the simple interface to enable/disable features

4. **Customize navigation** - Enable Remove Sidebar Clutter, then use Customize navigation to hide or reorder sidebar items. X's More menu remains unchanged.

5. **Enjoy a cleaner experience** - Changes apply instantly across the site

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
- `SidebarNavigationCustomizer` - Hides and reorders X's original sidebar rows while leaving its native More menu untouched
- `WhoToFollowRemover` - Removes follow suggestions
- `WhatsHappeningRemover` - Hides trending topics
- `TwitterBirdRestorer` - Restores classic Twitter branding

### Browser Support
- ✅ Firefox
- ✅ Brave
- ✅ Chrome
- ✅ Edge (Chromium-based)
- ✅ Other Chromium-based browsers

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


## 💖 Support

If you find this extension helpful, consider:

- ⭐ **Starring the repository & leaving a positive review on the Chrome Web Store page**
- 🐛 **Reporting bugs** or suggesting features
- ☕ **Buying me a coffee** on [Ko-Fi](https://ko-fi.com/nathant7)
- 🔗 **Sharing with friends** who might find it useful


**Thank you!!!**
