// X+ (Twitter+) App !
console.log('X+ (Twitter+) extension loaded');

// General cleanup function to hide empty containers
function cleanupEmptyContainers() {
  // Target the specific empty containers that are left behind
  const emptyContainerSelectors = [
    'div.css-175oi2r.r-yfoy6g.r-18bvks7.r-1867qdf.r-1phboty.r-rs99b7.r-1ifxtd0.r-1udh08x'
  ];

  emptyContainerSelectors.forEach(selector => {
    const containers = document.querySelectorAll(selector);
    containers.forEach(container => {
      // Check if this container has any visible children
      const visibleChildren = Array.from(container.children).filter(child =>
        child.style.display !== 'none' && child.offsetHeight > 0
      );

      // If no visible children, hide the container
      if (visibleChildren.length === 0) {
        container.style.display = 'none';
        console.log('Cleaned up empty container:', container);
      }
    });
  });
}

// Settings Manager Module
class SettingsManager {
  constructor() {
    this.settings = {
  removePremiumAds: false,
  removeSidebarClutter: false,
      removeWhoToFollow: false,
      removeProfileFeatures: false,
      removeGrok: false,
      restoreTwitterBird: false,
      removeWhatsHappening: false
    };
  }

  loadSettings() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['settings'], (result) => {
    if (result.settings) {
          this.settings = { ...this.settings, ...result.settings };
        }
        console.log('Loaded settings:', this.settings);
        resolve(this.settings);
      });
    });
  }

  saveSettings() {
    chrome.storage.local.set({ settings: this.settings });
    console.log('Saved settings:', this.settings);
  }

  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  getSettings() {
    return this.settings;
  }
}

// Premium Remover
class PremiumRemover {
  constructor() {
    this.isProcessing = false;
  }

  removePremiumAds() {
    if (this.isProcessing) return;
    this.isProcessing = true;
  
  console.log('Attempting to remove premium ads...');
  
    let foundElements = 0;

    const premiumUpsellSelectors = [
      '[data-testid="super-upsell-UpsellCardRenderProperties"]',
      '[data-testid="super-upsell"]',
      '[data-testid="upsell"]',
      '[data-testid="verified_profile_visitor_upsell"]',
      'div[aria-label*="Premium"]',
      'span[aria-label*="Premium"]',
      'a[aria-label*="Premium"]',
      'a[href="/i/premium_sign_up"]',
      'div[data-testid="verified_profile_visitor_upsell"]',
      'div.css-175oi2r.r-yfoy6g.r-18bvks7.r-1867qdf.r-1phboty.r-rs99b7.r-1ifxtd0.r-1udh08x',
      'div[style*="background-color: rgb(0, 67, 41)"]',
      'a[href="/i/premium_sign_up"][role="link"]'
    ];

    premiumUpsellSelectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        console.log(`Found ${elements.length} elements for selector: ${selector}`);
        elements.forEach(element => {
          if (selector.includes('css-175oi2r.r-yfoy6g.r-18bvks7.r-1867qdf.r-1phboty.r-rs99b7.r-1ifxtd0.r-1udh08x')) {
            const isInSidebar = element.closest('nav[role="navigation"]') || element.closest('[data-testid="sidebarColumn"]');
            if (isInSidebar) {
              return;
            }
          }

          if (element && element.style && element.style.display !== 'none') {
            element.style.display = 'none';
            foundElements++;
            console.log('Hidden premium element:', element);

            let currentParent = element.parentElement;
            for (let i = 0; i < 3; i++) {
              if (currentParent && currentParent !== document.body) {
                const visibleChildren = Array.from(currentParent.children).filter(child =>
                  child.style.display !== 'none' && child !== element
                );

                if (visibleChildren.length === 0) {
                  currentParent.style.display = 'none';
                  foundElements++;
                  console.log(`Hidden empty premium parent container:`, currentParent);
                } else {
                  break;
                }

                currentParent = currentParent.parentElement;
              } else {
                break;
              }
            }
          }
        });
      } catch (e) {
        console.log(`Error with selector ${selector}:`, e);
      }
    });

    const otherPremiumSelectors = [
    '[data-testid="premium"]',
    '[data-testid="premiumTweet"]',
    '[data-testid="premium-content"]',
    '[data-testid="premium-ad"]',
    '[data-testid="premiumPromotion"]',
    '[data-testid="promotedTweet"]',
      '[data-testid="ad"]'
    ];

    otherPremiumSelectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        console.log(`Found ${elements.length} elements for selector: ${selector}`);
        elements.forEach(element => {
          if (element && element.style && element.style.display !== 'none') {
            element.style.display = 'none';
            foundElements++;
            console.log('Hidden premium element:', element);
          }
        });
      } catch (e) {
        console.log(`Error with selector ${selector}:`, e);
      }
    });

    // Additional text-based detection for verification banners
    const allElements = document.querySelectorAll('*');
    allElements.forEach(element => {
      const text = element.textContent;
      if (text && (text.includes("You aren't verified yet") || text.includes("Get verified for boosted replies"))) {
        // Look for the specific green background container first
        let verificationBanner = element.closest('div[style*="background-color: rgb(0, 67, 41)"]');
        
        // If not found, look for the parent container that contains both text elements
        if (!verificationBanner) {
          verificationBanner = element.closest('div.css-175oi2r.r-1q9bdsx.r-1udh08x.r-18u37iz.r-1h0z5md');
        }
        
        // If still not found, look for the outermost container
        if (!verificationBanner) {
          verificationBanner = element.closest('div.css-175oi2r.r-1xpp3t0');
        }
        
        if (verificationBanner && verificationBanner.style && verificationBanner.style.display !== 'none') {
          verificationBanner.style.display = 'none';
          foundElements++;
          console.log('Hidden verification banner by text detection:', verificationBanner);
          
          // Also hide parent containers if they become empty
          let currentParent = verificationBanner.parentElement;
          for (let i = 0; i < 3; i++) {
            if (currentParent && currentParent !== document.body) {
              const visibleChildren = Array.from(currentParent.children).filter(child =>
                child.style.display !== 'none' && child !== verificationBanner
              );

              if (visibleChildren.length === 0) {
                currentParent.style.display = 'none';
                foundElements++;
                console.log(`Hidden empty verification banner parent container:`, currentParent);
              } else {
                break;
              }

              currentParent = currentParent.parentElement;
            } else {
              break;
            }
          }
        }
      }
    });

    console.log(`Total premium elements hidden: ${foundElements}`);
    this.isProcessing = false;
  }

  restorePremiumAds() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    console.log('Restoring premium ads...');

    const premiumUpsellSelectors = [
    '[data-testid="super-upsell-UpsellCardRenderProperties"]',
    '[data-testid="super-upsell"]',
    '[data-testid="upsell"]',
      '[data-testid="verified_profile_visitor_upsell"]',
    'div[aria-label*="Premium"]',
    'span[aria-label*="Premium"]',
      'a[aria-label*="Premium"]',
      'a[href="/i/premium_sign_up"]',
      'div[data-testid="verified_profile_visitor_upsell"]',
      'div.css-175oi2r.r-yfoy6g.r-18bvks7.r-1867qdf.r-1phboty.r-rs99b7.r-1ifxtd0.r-1udh08x',
      'div[style*="background-color: rgb(0, 67, 41)"]',
      'a[href="/i/premium_sign_up"][role="link"]'
    ];

    premiumUpsellSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (element && element.style && element.style.display === 'none') {
          element.style.display = '';
          console.log('Restored premium element:', element);

          let currentParent = element.parentElement;
          for (let i = 0; i < 3; i++) {
            if (currentParent && currentParent !== document.body && currentParent.style && currentParent.style.display === 'none') {
              currentParent.style.display = '';
              console.log(`Restored premium parent container:`, currentParent);
              currentParent = currentParent.parentElement;
            } else {
              break;
            }
          }
        }
      });
    });

    const otherPremiumSelectors = [
      '[data-testid="premium"]',
      '[data-testid="premiumTweet"]',
      '[data-testid="premium-content"]',
      '[data-testid="premium-ad"]',
      '[data-testid="premiumPromotion"]',
      '[data-testid="promotedTweet"]',
      '[data-testid="ad"]'
    ];

    otherPremiumSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (element && element.style) {
          element.style.display = '';
        }
      });
    });

    // Restore verification banners by text detection
    const allElements = document.querySelectorAll('*');
    allElements.forEach(element => {
      if (element && element.style && element.style.display === 'none') {
        const text = element.textContent;
        if (text && (text.includes("You aren't verified yet") || text.includes("Get verified for boosted replies"))) {
          element.style.display = '';
          console.log('Restored verification banner by text detection:', element);
          
          // Also restore parent containers
          let currentParent = element.parentElement;
          for (let i = 0; i < 3; i++) {
            if (currentParent && currentParent !== document.body && currentParent.style && currentParent.style.display === 'none') {
              currentParent.style.display = '';
              console.log(`Restored verification banner parent container:`, currentParent);
              currentParent = currentParent.parentElement;
            } else {
              break;
            }
          }
        }
      }
    });

    this.isProcessing = false;
  }
}

// Grok Remover 
class GrokRemover {
  constructor() {
    this.isProcessing = false;
  }

  removeGrok() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    console.log('Attempting to remove Grok...');

    const grokSelectors = [
      'a[href="/i/grok"]',
      '[data-testid="grok"]',
      'button[aria-label="Profile Summary"]',
      'button[aria-label="Grok actions"]',
      '[data-testid="GrokDrawer"]',
      'button[aria-label="Enhance your post with Grok"]',
      '[data-testid="grokImgGen"]'
  ];

  let foundElements = 0;

    grokSelectors.forEach(selector => {
    try {
      const elements = document.querySelectorAll(selector);
        console.log(`Found ${elements.length} Grok elements for selector: ${selector}`);
      elements.forEach(element => {
        if (element && element.style && element.style.display !== 'none') {
          element.style.display = 'none';
          foundElements++;
            console.log('Hidden Grok element:', element);
        }
      });
    } catch (e) {
      console.log(`Error with selector ${selector}:`, e);
    }
  });

  const allElements = document.querySelectorAll('*');
  allElements.forEach(element => {
      const text = element.textContent;
      if (text && text.includes('Grok')) {
        const navItem = element.closest('a[role="link"]') || element.closest('[data-testid]');
        if (navItem && navItem.style.display !== 'none') {
          const href = navItem.getAttribute('href');
          const role = navItem.getAttribute('role');
          const dataTestId = navItem.getAttribute('data-testid');

          if (role === 'tab') {
            return;
          }

          const hasSidebarHref = href && (href.startsWith('/i/') || href.includes('/grok'));
          const hasSidebarTestId = dataTestId && ['grok'].includes(dataTestId);

          if (hasSidebarHref || hasSidebarTestId) {
            navItem.style.display = 'none';
        foundElements++;
            console.log('Hidden text-based Grok element:', navItem);
          }
        }
      }
    });

    console.log(`Total Grok elements hidden: ${foundElements}`);
    this.isProcessing = false;
  }

  restoreGrok() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    console.log('Restoring Grok...');

    const grokSelectors = [
      'a[href="/i/grok"]',
      '[data-testid="grok"]',
      'button[aria-label="Profile Summary"]',
      'button[aria-label="Grok actions"]',
      '[data-testid="GrokDrawer"]',
      'button[aria-label="Enhance your post with Grok"]',
      '[data-testid="grokImgGen"]'
    ];

    grokSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (element && element.style) {
          element.style.display = '';
        }
      });
    });

    const allElements = document.querySelectorAll('*');
    allElements.forEach(element => {
      const text = element.textContent;
      if (text && text.includes('Grok')) {
        const navItem = element.closest('a[role="link"]') || element.closest('[data-testid]');
        if (navItem && navItem.style && navItem.style.display === 'none') {
          const href = navItem.getAttribute('href');
          const role = navItem.getAttribute('role');
          const dataTestId = navItem.getAttribute('data-testid');

          if (role === 'tab') {
            return;
          }

          const hasSidebarHref = href && (href.startsWith('/i/') || href.includes('/grok'));
          const hasSidebarTestId = dataTestId && ['grok'].includes(dataTestId);

          if (hasSidebarHref || hasSidebarTestId) {
            navItem.style.display = '';
            console.log('Restored text-based Grok element:', navItem);
          }
        }
      }
    });

    this.isProcessing = false;
  }
}

// Twitter Bird Restorer
class TwitterBirdRestorer {
  constructor() {
    this.isProcessing = false;
  }

  restoreTwitterBird() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    console.log('Attempting to restore Twitter bird...');

    let foundElements = 0;

    // Target X logos and replace with Twitter bird
    const xLogoSelectors = [
      'a[aria-label="X"] svg',
      'a[aria-label="X"] div[dir="ltr"] svg',
      'svg[aria-label="X"]',
      'svg[aria-label="X logo"]'
    ];

    xLogoSelectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        console.log(`Found ${elements.length} X logo elements for selector: ${selector}`);
        elements.forEach(element => {
          const parentLink = element.closest('a');
          if (parentLink && parentLink.getAttribute('href') === '/home') {
            const ariaLabel = parentLink.getAttribute('aria-label');
            if (ariaLabel !== 'X') {
              return;
            }
          }

          if (element && element.style && element.style.display !== 'none') {
            if (!element.hasAttribute('data-original-svg')) {
              element.setAttribute('data-original-svg', element.innerHTML);
            }

            element.innerHTML = `
              <g>
                <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"/>
              </g>
            `;
        foundElements++;
            console.log('Restored Twitter bird:', element);
          }
        });
      } catch (e) {
        console.log(`Error with selector ${selector}:`, e);
      }
    });

    const allElements = document.querySelectorAll('*');
    allElements.forEach(element => {
      const text = element.textContent;
      if (text && (text.includes('X') || text.includes('𝕏'))) {
        const isLogoElement = element.closest('a[aria-label="X"]') ||
          element.closest('a[href="/home"]') ||
          element.closest('h1') ||
          element.closest('div[role="banner"]');

        if (isLogoElement && element.style && element.style.display !== 'none') {
          element.innerHTML = '🐦';
          foundElements++;
          console.log('Restored Twitter bird text:', element);
        }
      }
    });

    // Replace "Post" with "Tweet"
    const postElements = document.querySelectorAll('*');
    postElements.forEach(element => {
      const text = element.textContent;
      if (text && text.trim() === 'Post') {
        const isPostButton = element.closest('button[data-testid="tweetButtonInline"]') ||
          element.closest('a[data-testid="SideNav_NewTweet_Button"]') ||
          element.closest('button[aria-label*="Post"]') ||
          element.closest('a[aria-label*="Post"]');

        if (isPostButton && element.style && element.style.display !== 'none') {
          const originalColor = element.style.color;
          const originalFontWeight = element.style.fontWeight;
          const originalFontSize = element.style.fontSize;

          if (element.innerHTML.includes('Post')) {
            element.innerHTML = element.innerHTML.replace(/Post/g, 'Tweet');
          } else {
            element.textContent = 'Tweet';
          }

          if (originalColor) element.style.color = originalColor;
          if (originalFontWeight) element.style.fontWeight = originalFontWeight;
          if (originalFontSize) element.style.fontSize = originalFontSize;

          foundElements++;
          console.log('Replaced Post with Tweet:', element);
        }
      }
    });

    console.log(`Total Twitter bird elements restored: ${foundElements}`);
    this.isProcessing = false;
  }

  removeTwitterBird() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    console.log('Removing Twitter bird restoration...');

    const twitterBirdSvgs = document.querySelectorAll('svg');
    twitterBirdSvgs.forEach(svg => {
      if (svg.innerHTML.includes('M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z')) {
        // Skip home icon - don't restore home icon
        const parentLink = svg.closest('a');
        if (parentLink && parentLink.getAttribute('href') === '/home') {
          const ariaLabel = parentLink.getAttribute('aria-label');
          if (ariaLabel !== 'X') {
            return;
          }
        }

        if (svg.hasAttribute('data-original-svg')) {
          svg.innerHTML = svg.getAttribute('data-original-svg');
          svg.removeAttribute('data-original-svg');
          console.log('Restored original X logo:', svg);
        }
      }
    });

    const tweetElements = document.querySelectorAll('*');
    tweetElements.forEach(element => {
      const text = element.textContent;
      if (text && text.trim() === 'Tweet') {
        const isTweetButton = element.closest('button[data-testid="tweetButtonInline"]') ||
          element.closest('a[data-testid="SideNav_NewTweet_Button"]') ||
          element.closest('button[aria-label*="Post"]') ||
          element.closest('a[aria-label*="Post"]');

        if (isTweetButton && element.style && element.style.display !== 'none') {
          const originalColor = element.style.color;
          const originalFontWeight = element.style.fontWeight;
          const originalFontSize = element.style.fontSize;

          if (element.innerHTML.includes('Tweet')) {
            element.innerHTML = element.innerHTML.replace(/Tweet/g, 'Post');
          } else {
            element.textContent = 'Post';
          }

          if (originalColor) element.style.color = originalColor;
          if (originalFontWeight) element.style.fontWeight = originalFontWeight;
          if (originalFontSize) element.style.fontSize = originalFontSize;

          console.log('Restored Tweet back to Post:', element);
        }
      }
    });

    console.log('Twitter bird restoration removed');

    this.isProcessing = false;
  }
}

// What's Happening Remover
class WhatsHappeningRemover {
  constructor() {
    this.isProcessing = false;
  }

  removeWhatsHappening() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    console.log('Attempting to remove "What\'s happening" section...');

    let foundElements = 0;

    const whatsHappeningSelectors = [
      'div[aria-label="Timeline: Trending now"]'
    ];

    whatsHappeningSelectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        console.log(`Found ${elements.length} "What's happening" elements for selector: ${selector}`);
        elements.forEach(element => {
          if (element && element.style && element.style.display !== 'none') {
            element.style.display = 'none';
            foundElements++;
            console.log('Hidden "What\'s happening" element:', element);
          }
        });
      } catch (e) {
        console.log(`Error with selector ${selector}:`, e);
      }
    });

    console.log(`Total "What's happening" elements hidden: ${foundElements}`);
    this.isProcessing = false;
  }

  restoreWhatsHappening() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    console.log('Restoring "What\'s happening" section...');

    const whatsHappeningSelectors = [
      'div[aria-label="Timeline: Trending now"]'
    ];

    whatsHappeningSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (element && element.style && element.style.display === 'none') {
          element.style.display = '';
          console.log('Restored "What\'s happening" element:', element);
        }
      });
    });

    // Also restore parent containers that might have been hidden
    const allElements = document.querySelectorAll('*');
    allElements.forEach(element => {
      if (element && element.style && element.style.display === 'none') {
        // Check if this element contains or is related to "What's happening" content
        const hasWhatsHappeningContent = element.querySelector('div[aria-label="Timeline: Trending now"]') ||
                                        element.textContent?.includes('Trending') ||
                                        element.textContent?.includes('What\'s happening');
        
        if (hasWhatsHappeningContent) {
          element.style.display = '';
          console.log('Restored "What\'s happening" related element:', element);
        }
      }
    });

    this.isProcessing = false;
  }
}

// Sidebar Clutter Remover
class SidebarClutterRemover {
  constructor() {
    this.isProcessing = false;
  }

  removeSidebarClutter() {
    if (this.isProcessing) return;
    this.isProcessing = true;
  
  console.log('Attempting to remove sidebar clutter...');
  
  const sidebarClutterSelectors = [
    // Lists
    'a[href="/i/lists"]',
      'a[href*="/lists"]',
    '[data-testid="lists"]',
    // Jobs
    'a[href="/i/jobs"]',
      'a[href*="/jobs"]',
    '[data-testid="jobs"]',
    // Communities
    'a[href="/i/communities"]',
      'a[href*="/communities"]',
    '[data-testid="communities"]',
    // Verified Orgs
    'a[href="/i/verified_orgs"]',
      'a[href="/i/verified-orgs-signup"]',
      'a[href*="/verified-orgs"]',
    '[data-testid="verified_orgs"]',
      '[data-testid="vo-signup-tab"]'
  ];

  let foundElements = 0;

  sidebarClutterSelectors.forEach(selector => {
    try {
      const elements = document.querySelectorAll(selector);
      console.log(`Found ${elements.length} elements for selector: ${selector}`);
      elements.forEach(element => {
        if (element && element.style && element.style.display !== 'none') {
          element.style.display = 'none';
          foundElements++;
          console.log('Hidden sidebar element:', element);
        }
      });
    } catch (e) {
      console.log(`Error with selector ${selector}:`, e);
    }
  });

  const allElements = document.querySelectorAll('*');
  allElements.forEach(element => {
    const text = element.textContent;
    if (text) {
        if (text.includes('Lists') || text.includes('Jobs') ||
          text.includes('Communities') || text.includes('Verified Orgs')) {
        const navItem = element.closest('a[role="link"]') || element.closest('[data-testid]');
        if (navItem && navItem.style.display !== 'none') {
            const href = navItem.getAttribute('href');
            const role = navItem.getAttribute('role');
            const dataTestId = navItem.getAttribute('data-testid');

            if (role === 'tab') {
              return;
            }

            const hasSidebarHref = href && (href.startsWith('/i/') || href.includes('/lists') || href.includes('/jobs') || href.includes('/communities') || href.includes('/verified-orgs'));
            const hasSidebarTestId = dataTestId && ['lists', 'jobs', 'communities', 'verified_orgs', 'vo-signup-tab'].includes(dataTestId);

            console.log('Text-based detection debug:', {
              text: text.trim(),
              href: href,
              role: role,
              dataTestId: dataTestId,
              hasSidebarHref: hasSidebarHref,
              hasSidebarTestId: hasSidebarTestId,
              element: navItem
            });

            if (!hasSidebarHref && !hasSidebarTestId) {
              return;
            }

          navItem.style.display = 'none';
          foundElements++;
          console.log('Hidden text-based sidebar element:', navItem);
        }
      }
    }
  });

  console.log(`Total sidebar elements hidden: ${foundElements}`);
    this.isProcessing = false;
  }

  restoreSidebarClutter() {
    if (this.isProcessing) return;
    this.isProcessing = true;
  
  console.log('Restoring sidebar clutter...');
  
  const sidebarClutterSelectors = [
    'a[href="/i/lists"]',
      'a[href*="/lists"]',
    'a[href="/i/jobs"]',
      'a[href*="/jobs"]',
    'a[href="/i/communities"]',
      'a[href*="/communities"]',
    'a[href="/i/verified_orgs"]',
      'a[href="/i/verified-orgs-signup"]',
      'a[href*="/verified-orgs"]',
    '[data-testid="lists"]',
    '[data-testid="jobs"]',
    '[data-testid="communities"]',
      '[data-testid="verified_orgs"]',
      '[data-testid="vo-signup-tab"]'
  ];

  sidebarClutterSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      if (element && element.style) {
        element.style.display = '';
      }
    });
  });

  const allElements = document.querySelectorAll('*');
  allElements.forEach(element => {
    const text = element.textContent;
    if (text) {
        if (text.includes('Lists') || text.includes('Jobs') ||
          text.includes('Communities') || text.includes('Verified Orgs')) {
        const navItem = element.closest('a[role="link"]') || element.closest('[data-testid]');
        if (navItem && navItem.style && navItem.style.display === 'none') {
            const href = navItem.getAttribute('href');
            const role = navItem.getAttribute('role');
            const dataTestId = navItem.getAttribute('data-testid');

            if (role === 'tab') {
              return;
            }

            const hasSidebarHref = href && (href.startsWith('/i/') || href.includes('/lists') || href.includes('/jobs') || href.includes('/communities') || href.includes('/verified-orgs'));
            const hasSidebarTestId = dataTestId && ['lists', 'jobs', 'communities', 'verified_orgs', 'vo-signup-tab'].includes(dataTestId);

            if (!hasSidebarHref && !hasSidebarTestId) {
              return;
            }

          navItem.style.display = '';
          console.log('Restored text-based sidebar element:', navItem);
        }
      }
    }
  });
  
    this.isProcessing = false;
  }
}

// Who to Follow Remover
class WhoToFollowRemover {
  constructor() {
    this.isProcessing = false;
  }

  removeWhoToFollow() {
    if (this.isProcessing) return;
    this.isProcessing = true;
  
  console.log('Attempting to remove "Who to follow" section...');
  
    let foundElements = 0;

    const whoToFollowAside = document.querySelector('aside[aria-label="Who to follow"]');

    if (whoToFollowAside && whoToFollowAside.style.display !== 'none') {
      whoToFollowAside.style.display = 'none';
      foundElements++;
      console.log('Hidden "Who to follow" aside:', whoToFollowAside);

      let currentParent = whoToFollowAside.parentElement;
      for (let i = 0; i < 3; i++) {
        if (currentParent && currentParent !== document.body) {
          const visibleChildren = Array.from(currentParent.children).filter(child =>
            child.style.display !== 'none' && child !== whoToFollowAside
          );

          if (visibleChildren.length === 0) {
            currentParent.style.display = 'none';
            foundElements++;
            console.log(`Hidden empty parent container:`, currentParent);
          } else {
            break;
          }

          currentParent = currentParent.parentElement;
        } else {
          break;
        }
      }
    }

  const whoToFollowSelectors = [
    '[data-testid="whoToFollow"]',
    '[data-testid="who-to-follow"]',
    '[data-testid="whoToFollowSection"]',
    '[data-testid="whoToFollowModule"]',
      '[data-testid="whoToFollowList"]'
  ];

  whoToFollowSelectors.forEach(selector => {
    try {
      const elements = document.querySelectorAll(selector);
      console.log(`Found ${elements.length} elements for selector: ${selector}`);
      elements.forEach(element => {
        if (element && element.style && element.style.display !== 'none') {
          element.style.display = 'none';
          foundElements++;
          console.log('Hidden "Who to follow" element:', element);
        }
      });
    } catch (e) {
      console.log(`Error with selector ${selector}:`, e);
    }
  });

    console.log(`Total "Who to follow" elements hidden: ${foundElements}`);
    this.isProcessing = false;
  }

  restoreWhoToFollow() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    console.log('Restoring "Who to follow" section...');

    const whoToFollowAside = document.querySelector('aside[aria-label="Who to follow"]');

    if (whoToFollowAside && whoToFollowAside.style && whoToFollowAside.style.display === 'none') {
      whoToFollowAside.style.display = '';
      console.log('Restored "Who to follow" aside:', whoToFollowAside);

      let currentParent = whoToFollowAside.parentElement;
      for (let i = 0; i < 3; i++) {
        if (currentParent && currentParent !== document.body && currentParent.style && currentParent.style.display === 'none') {
          currentParent.style.display = '';
          console.log(`Restored parent container:`, currentParent);
          currentParent = currentParent.parentElement;
        } else {
          break;
        }
      }
    }

    const whoToFollowSelectors = [
      '[data-testid="whoToFollow"]',
      '[data-testid="who-to-follow"]',
      '[data-testid="whoToFollowSection"]',
      '[data-testid="whoToFollowModule"]',
      '[data-testid="whoToFollowList"]'
    ];

    whoToFollowSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (element && element.style) {
          element.style.display = '';
        }
      });
    });

    this.isProcessing = false;
  }

  removeProfileWhoToFollow() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    console.log('Attempting to remove ALL UserCells on the page...');

    // Need to preserve users on this page, as it is a valid user search 
    const isSearchPage = window.location.pathname.includes('/search');
    if (isSearchPage) {
      console.log('On search page - skipping UserCell removal to preserve search results');
      this.isProcessing = false;
      return;
    }

    let foundElements = 0;

    const allUserCells = document.querySelectorAll('button[data-testid="UserCell"]');
    console.log(`Found ${allUserCells.length} total user cells - removing ALL of them!`);

    // Find and remove "Who to follow" headings
    const whoToFollowHeadings = document.querySelectorAll('h2[aria-level="2"][role="heading"]');
    console.log(`Found ${whoToFollowHeadings.length} potential "Who to follow" headings`);

    // Find and remove "Show more" links
    const showMoreLinks = document.querySelectorAll('a[href*="connect_people"]');
    console.log(`Found ${showMoreLinks.length} "Show more" links`);

    // Find and remove spacers that might be left behind
    const spacers = document.querySelectorAll('div.css-175oi2r.r-l00any.r-109y4c4.r-kuekak');
    console.log(`Found ${spacers.length} spacer elements`);

    const elementsToHide = [];

    allUserCells.forEach(cell => {
      const cellContainer = cell.closest('div[data-testid="cellInnerDiv"]');
      if (cellContainer) {
        elementsToHide.push(cellContainer);
        console.log('Added UserCell to hide:', cellContainer);
      }
    });

    whoToFollowHeadings.forEach(heading => {
      if (heading.textContent.includes('Who to follow')) {
        const headingContainer = heading.closest('div[data-testid="cellInnerDiv"]');
        if (headingContainer) {
          elementsToHide.push(headingContainer);
          console.log('Added "Who to follow" heading to hide:', headingContainer);
        }
      }
    });

    showMoreLinks.forEach(link => {
      const linkContainer = link.closest('div[data-testid="cellInnerDiv"]');
      if (linkContainer) {
        elementsToHide.push(linkContainer);
        console.log('Added "Show more" link to hide:', linkContainer);
      }
    });

    spacers.forEach(spacer => {
      const spacerContainer = spacer.closest('div[data-testid="cellInnerDiv"]');
      if (spacerContainer) {
        elementsToHide.push(spacerContainer);
        console.log('Added spacer to hide:', spacerContainer);
      }
    });

    console.log(`Total elements to hide: ${elementsToHide.length}`);

    elementsToHide.forEach(element => {
      if (element && element.style && element.style.display !== 'none') {
        element.style.display = 'none';
          foundElements++;
        console.log('Hidden profile "Who to follow" element:', element);
      }
    });

    elementsToHide.forEach(element => {
      let currentParent = element.parentElement;
      for (let i = 0; i < 5; i++) {
        if (currentParent && currentParent !== document.body) {
          const visibleChildren = Array.from(currentParent.children).filter(child =>
            child.style.display !== 'none' && !elementsToHide.includes(child)
          );

              if (visibleChildren.length === 0) {
            currentParent.style.display = 'none';
                foundElements++;
            console.log(`Hidden empty parent container:`, currentParent);
          } else {
            break;
          }

          currentParent = currentParent.parentElement;
        } else {
          break;
        }
      }
    });

    const profileWhoToFollowSelectors = [
      '[data-testid="whoToFollow"]',
      '[data-testid="who-to-follow"]',
      '[data-testid="whoToFollowSection"]',
      '[data-testid="whoToFollowModule"]',
      '[data-testid="whoToFollowList"]',
      '[data-testid="profileWhoToFollow"]',
      '[data-testid="profile-who-to-follow"]',
      'div[aria-label*="Who to follow"]',
      'section[aria-label*="Who to follow"]',
      'aside[aria-label*="Who to follow"]'
    ];

    profileWhoToFollowSelectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        console.log(`Found ${elements.length} profile "Who to follow" elements for selector: ${selector}`);
        elements.forEach(element => {
          if (element && element.style && element.style.display !== 'none') {
            element.style.display = 'none';
            foundElements++;
            console.log('Hidden profile "Who to follow" element:', element);

            let currentParent = element.parentElement;
            for (let i = 0; i < 3; i++) {
              if (currentParent && currentParent !== document.body) {
                const visibleChildren = Array.from(currentParent.children).filter(child =>
                  child.style.display !== 'none' && child !== element
                );

                if (visibleChildren.length === 0) {
                  currentParent.style.display = 'none';
                  foundElements++;
                  console.log(`Hidden empty profile parent container:`, currentParent);
          } else {
            break;
          }

                currentParent = currentParent.parentElement;
              } else {
                break;
              }
            }
          }
        });
      } catch (e) {
        console.log(`Error with profile selector ${selector}:`, e);
      }
    });

    console.log(`Total UserCell elements hidden: ${foundElements}`);
    this.isProcessing = false;
  }

  restoreProfileWhoToFollow() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    console.log('Restoring ALL UserCells on the page...');

    const allUserCells = document.querySelectorAll('button[data-testid="UserCell"]');
    console.log(`Found ${allUserCells.length} total user cells - restoring ALL of them!`);

    const whoToFollowHeadings = document.querySelectorAll('h2[aria-level="2"][role="heading"]');
    console.log(`Found ${whoToFollowHeadings.length} potential "Who to follow" headings`);

    const showMoreLinks = document.querySelectorAll('a[href*="connect_people"]');
    console.log(`Found ${showMoreLinks.length} "Show more" links`);

    const spacers = document.querySelectorAll('div.css-175oi2r.r-l00any.r-109y4c4.r-kuekak');
    console.log(`Found ${spacers.length} spacer elements`);

    const elementsToRestore = [];

    allUserCells.forEach(cell => {
      const cellContainer = cell.closest('div[data-testid="cellInnerDiv"]');
      if (cellContainer) {
        elementsToRestore.push(cellContainer);
        console.log('Added UserCell to restore:', cellContainer);
      }
    });


    whoToFollowHeadings.forEach(heading => {
      if (heading.textContent.includes('Who to follow')) {
        const headingContainer = heading.closest('div[data-testid="cellInnerDiv"]');
        if (headingContainer) {
          elementsToRestore.push(headingContainer);
          console.log('Added "Who to follow" heading to restore:', headingContainer);
        }
      }
    });


    showMoreLinks.forEach(link => {
      const linkContainer = link.closest('div[data-testid="cellInnerDiv"]');
      if (linkContainer) {
        elementsToRestore.push(linkContainer);
        console.log('Added "Show more" link to restore:', linkContainer);
      }
    });


    spacers.forEach(spacer => {
      const spacerContainer = spacer.closest('div[data-testid="cellInnerDiv"]');
      if (spacerContainer) {
        elementsToRestore.push(spacerContainer);
        console.log('Added spacer to restore:', spacerContainer);
      }
    });

    console.log(`Total elements to restore: ${elementsToRestore.length}`);


    elementsToRestore.forEach(element => {
      if (element && element.style && element.style.display === 'none') {
        element.style.display = '';
        console.log('Restored UserCell element:', element);
      }
    });


    elementsToRestore.forEach(element => {
      let currentParent = element.parentElement;
      for (let i = 0; i < 5; i++) {
        if (currentParent && currentParent !== document.body && currentParent.style && currentParent.style.display === 'none') {
          currentParent.style.display = '';
          console.log(`Restored parent container:`, currentParent);
          currentParent = currentParent.parentElement;
        } else {
          break;
        }
      }
    });

    const profileWhoToFollowSelectors = [
    '[data-testid="whoToFollow"]',
    '[data-testid="who-to-follow"]',
    '[data-testid="whoToFollowSection"]',
    '[data-testid="whoToFollowModule"]',
    '[data-testid="whoToFollowList"]',
      '[data-testid="profileWhoToFollow"]',
      '[data-testid="profile-who-to-follow"]',
      'div[aria-label*="Who to follow"]',
      'section[aria-label*="Who to follow"]',
      'aside[aria-label*="Who to follow"]'
    ];

    profileWhoToFollowSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
        if (element && element.style && element.style.display === 'none') {
        element.style.display = '';
          console.log('Restored profile "Who to follow" element:', element);

          // Also restore parent containers that might have been hidden
          let currentParent = element.parentElement;
          for (let i = 0; i < 3; i++) {
            if (currentParent && currentParent !== document.body && currentParent.style && currentParent.style.display === 'none') {
              currentParent.style.display = '';
              console.log(`Restored profile parent container:`, currentParent);
              currentParent = currentParent.parentElement;
            } else {
              break;
            }
          }
      }
    });
  });

    this.isProcessing = false;
  }
}

// Profile Features Remover 
class ProfileFeaturesRemover {
  constructor() {
    this.isProcessing = false;
  }

  removeProfileFeatures() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    console.log('Attempting to remove profile features (Articles, Highlights)...');

    let foundElements = 0;

    const profileFeatureSelectors = [
      'a[href*="/highlights"]',
      'a[href*="/articles"][role="tab"]',
      'a[role="tab"][href*="/highlights"]',
      'a[role="tab"][href*="/articles"]'
    ];

    profileFeatureSelectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        console.log(`Found ${elements.length} profile feature elements for selector: ${selector}`);
        elements.forEach(element => {
          if (element && element.style && element.style.display !== 'none') {

            element.style.display = 'none';
            foundElements++;
            console.log('Hidden profile feature tab:', element);


            const parentContainer = element.closest('div[role="presentation"]');
            if (parentContainer && parentContainer.style && parentContainer.style.display !== 'none') {
              parentContainer.style.display = 'none';
              foundElements++;
              console.log('Hidden profile feature parent container:', parentContainer);
            }
          }
        });
      } catch (e) {
        console.log(`Error with profile feature selector ${selector}:`, e);
      }
    });


  const allElements = document.querySelectorAll('*');
  allElements.forEach(element => {
    const text = element.textContent;
      if (text && (text.trim() === 'Articles' || text.trim() === 'Highlights')) {
        if (element.tagName === 'SPAN' && element.classList.contains('css-1jxf684')) {

          const tabLink = element.closest('a[role="tab"]');
          if (tabLink && tabLink.style && tabLink.style.display !== 'none') {
            tabLink.style.display = 'none';
            foundElements++;
            console.log('Hidden profile feature tab by text:', tabLink);


            const parentContainer = tabLink.closest('div[role="presentation"]');
            if (parentContainer && parentContainer.style && parentContainer.style.display !== 'none') {
              parentContainer.style.display = 'none';
              foundElements++;
              console.log('Hidden profile feature parent container by text:', parentContainer);
            }
          }
        }
      }
    });

    console.log(`Total profile feature elements hidden: ${foundElements}`);
    this.isProcessing = false;
  }

  restoreProfileFeatures() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    console.log('Restoring profile features (Articles, Highlights)...');

    const profileFeatureSelectors = [
      'a[href*="/highlights"]',
      'a[href*="/articles"][role="tab"]',
      'a[role="tab"][href*="/highlights"]',
      'a[role="tab"][href*="/articles"]'
    ];

    profileFeatureSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (element && element.style && element.style.display === 'none') {
          element.style.display = '';
          console.log('Restored profile feature tab:', element);
        }
      });
    });


    const allElements = document.querySelectorAll('*');
    allElements.forEach(element => {
      if (element && element.style && element.style.display === 'none') {
        if (element.getAttribute('role') === 'presentation') {
          const hasHiddenTab = element.querySelector('a[role="tab"][style*="display: none"]');
          if (!hasHiddenTab) {
            element.style.display = '';
            console.log('Restored profile feature parent container:', element);
        }
      }
    }
  });
  
    this.isProcessing = false;
  }
}

// Initialize modules
const settingsManager = new SettingsManager();
const premiumRemover = new PremiumRemover();
const grokRemover = new GrokRemover();
const sidebarClutterRemover = new SidebarClutterRemover();
const whoToFollowRemover = new WhoToFollowRemover();
const profileFeaturesRemover = new ProfileFeaturesRemover();
const twitterBirdRestorer = new TwitterBirdRestorer();
const whatsHappeningRemover = new WhatsHappeningRemover();

// Flag to prevent infinite loops
let isProcessing = false;

// Apply all active features
function applyFeatures() {
  if (isProcessing) return;
  
  const settings = settingsManager.getSettings();
  console.log('Applying features, removePremiumAds:', settings.removePremiumAds, 'removeSidebarClutter:', settings.removeSidebarClutter, 'removeWhoToFollow:', settings.removeWhoToFollow, 'removeProfileFeatures:', settings.removeProfileFeatures, 'removeGrok:', settings.removeGrok, 'restoreTwitterBird:', settings.restoreTwitterBird, 'removeWhatsHappening:', settings.removeWhatsHappening);
  
  if (settings.removePremiumAds) {
    premiumRemover.removePremiumAds();
  } else {
    premiumRemover.restorePremiumAds();
  }

  if (settings.removeGrok) {
    grokRemover.removeGrok();
  } else {
    grokRemover.restoreGrok();
  }
  
  if (settings.removeSidebarClutter) {
    sidebarClutterRemover.removeSidebarClutter();
  } else {
    sidebarClutterRemover.restoreSidebarClutter();
  }
  
  if (settings.removeWhoToFollow) {
    whoToFollowRemover.removeWhoToFollow();

    whoToFollowRemover.removeProfileWhoToFollow();
  } else {
    whoToFollowRemover.restoreWhoToFollow();

    whoToFollowRemover.restoreProfileWhoToFollow();
  }

  if (settings.removeProfileFeatures) {
    profileFeaturesRemover.removeProfileFeatures();
  } else {
    profileFeaturesRemover.restoreProfileFeatures();
  }

  if (settings.restoreTwitterBird) {
    twitterBirdRestorer.restoreTwitterBird();
  } else {
    twitterBirdRestorer.removeTwitterBird();
  }

  if (settings.removeWhatsHappening) {
    whatsHappeningRemover.removeWhatsHappening();
  } else {
    whatsHappeningRemover.restoreWhatsHappening();
  }

  // Clean up any empty containers that might be left behind
  cleanupEmptyContainers();
}

// Set up observer for dynamic content with debouncing
let observerTimeout;
function setupObserver() {
  const observer = new MutationObserver((mutations) => {
    // Clear previous timeout
    if (observerTimeout) {
      clearTimeout(observerTimeout);
    }
    
    // Debounce the observer to prevent spam
    observerTimeout = setTimeout(() => {
      if (!isProcessing) {
        console.log('New content detected, applying features...');
        applyFeatures();
      }
    }, 100);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Received message:', request);
  if (request.action === 'updateSettings') {
    settingsManager.updateSettings(request.settings);
    applyFeatures();
    sendResponse({ success: true });
  } else if (request.action === 'getSettings') {
    sendResponse({ settings: settingsManager.getSettings() });
  }
});

// Initialize the extension
async function init() {
  console.log('X+ (Twitter+) initialized');
  await settingsManager.loadSettings();
  setupObserver();
  applyFeatures();
}

// Run when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Test function - you can call this from browser console
window.testDeclutter = function () {
  console.log('Testing declutter...');
  settingsManager.updateSettings({
    removePremiumAds: true,
    removeSidebarClutter: true,
    removeWhoToFollow: true,
    removeProfileFeatures: true
  });
  applyFeatures();
};

window.declutterSettings = settingsManager.getSettings();
