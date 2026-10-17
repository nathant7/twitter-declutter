// X+ (Twitter+) App !
console.log('X+ (Twitter+) extension loaded');

// Settings Manager Module
class SettingsManager {
  constructor() {
    this.settings = {
  removePremiumAds: false,
  removeSidebarClutter: false,
      removeWhoToFollow: false,
      sidebarNavigationItems: [],
      removeGrok: false,
      restoreTwitterBird: false,
      removeWhatsHappening: false
    };
  }

  loadSettings() {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(['settings'], (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(`Unable to load settings: ${chrome.runtime.lastError.message}`));
          return;
        }
        if (result.settings) {
          this.settings = { ...this.settings, ...result.settings };
        }
        resolve(this.settings);
      });
    });
  }

  saveSettings() {
    chrome.storage.local.set({ settings: this.settings }, () => {
      if (chrome.runtime.lastError) {
        console.error('Unable to save settings:', chrome.runtime.lastError);
      }
    });
  }

  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  getSettings() {
    return this.settings;
  }
}

const HIDDEN_BY_ATTRIBUTE = 'data-xplus-hidden-by';
const ORIGINAL_DISPLAY_ATTRIBUTE = 'data-xplus-original-display';

function hideElementForFeature(element, feature) {
  if (!element?.style) return false;

  const owners = new Set((element.getAttribute(HIDDEN_BY_ATTRIBUTE) || '').split(' ').filter(Boolean));
  if (owners.has(feature)) {
    element.style.display = 'none';
    return false;
  }
  if (!owners.size) {
    if (element.style.display === 'none') return false;
    element.setAttribute(ORIGINAL_DISPLAY_ATTRIBUTE, element.style.display);
  }

  owners.add(feature);
  element.setAttribute(HIDDEN_BY_ATTRIBUTE, Array.from(owners).join(' '));
  element.style.display = 'none';
  return true;
}

function restoreElementsForFeature(feature) {
  document.querySelectorAll(`[${HIDDEN_BY_ATTRIBUTE}]`).forEach(element => {
    const owners = new Set((element.getAttribute(HIDDEN_BY_ATTRIBUTE) || '').split(' ').filter(Boolean));
    if (!owners.delete(feature)) return;

    if (owners.size) {
      element.setAttribute(HIDDEN_BY_ATTRIBUTE, Array.from(owners).join(' '));
      return;
    }

    element.style.display = element.getAttribute(ORIGINAL_DISPLAY_ATTRIBUTE) || '';
    element.removeAttribute(HIDDEN_BY_ATTRIBUTE);
    element.removeAttribute(ORIGINAL_DISPLAY_ATTRIBUTE);
  });
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
      'aside[aria-label="Subscribe to Premium"]',
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

          if (hideElementForFeature(element, 'premium')) {
            foundElements++;
            console.log('Hidden premium element:', element);

            let currentParent = element.parentElement;
            for (let i = 0; i < 3; i++) {
              if (currentParent && currentParent !== document.body) {
                const visibleChildren = Array.from(currentParent.children).filter(child =>
                  child.style.display !== 'none' && child !== element
                );

                if (visibleChildren.length === 0) {
                  if (hideElementForFeature(currentParent, 'premium')) {
                    foundElements++;
                    console.log('Hidden empty premium parent container:', currentParent);
                  }
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
          if (hideElementForFeature(element, 'premium')) {
            foundElements++;
            console.log('Hidden premium element:', element);
          }
        });
      } catch (e) {
        console.log(`Error with selector ${selector}:`, e);
      }
    });

    // Additional text-based detection for verification banners
    const textWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const processedBanners = new Set();
    let textNode;
    while ((textNode = textWalker.nextNode())) {
      const text = textNode.nodeValue || '';
      if (!text.includes("You aren't verified yet") && !text.includes('Get verified for boosted replies')) {
        continue;
      }

      const element = textNode.parentElement;
      if (!element) continue;

      const verificationBanner =
        element.closest('div[style*="background-color: rgb(0, 67, 41)"]') ||
        element.closest('div.css-175oi2r.r-1q9bdsx.r-1udh08x.r-18u37iz.r-1h0z5md') ||
        element.closest('div.css-175oi2r.r-1xpp3t0');
      if (!verificationBanner || processedBanners.has(verificationBanner)) continue;
      processedBanners.add(verificationBanner);

      if (!hideElementForFeature(verificationBanner, 'premium')) continue;
      foundElements++;
      console.log('Hidden verification banner by text detection:', verificationBanner);

      let currentParent = verificationBanner.parentElement;
      for (let i = 0; i < 3; i++) {
        if (!currentParent || currentParent === document.body) break;

        const visibleChildren = Array.from(currentParent.children).filter(child =>
          child.style.display !== 'none' && child !== verificationBanner
        );
        if (visibleChildren.length !== 0) break;

        if (hideElementForFeature(currentParent, 'premium')) {
          foundElements++;
          console.log('Hidden empty verification banner parent container:', currentParent);
        }
        currentParent = currentParent.parentElement;
      }
    }

    console.log(`Total premium elements hidden: ${foundElements}`);
    this.isProcessing = false;
  }

  restorePremiumAds() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    restoreElementsForFeature('premium');

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
          if (hideElementForFeature(element, 'grok')) {
            foundElements++;
            console.log('Hidden Grok element:', element);
          }
        });
      } catch (error) {
        console.error(`Unable to process Grok selector "${selector}":`, error);
      }
    });

    const navigationCandidates = document.querySelectorAll('a[role="link"], [data-testid]');
    navigationCandidates.forEach(navItem => {
      if (navItem.matches('[data-testid]') && navItem.closest('a[role="link"]')) return;
      if (!navItem.textContent?.includes('Grok')) return;
      const href = navItem.getAttribute('href');
      const role = navItem.getAttribute('role');
      const dataTestId = navItem.getAttribute('data-testid');
      if (role === 'tab') return;

      const hasSidebarHref = href && (href.startsWith('/i/') || href.includes('/grok'));
      const hasSidebarTestId = dataTestId === 'grok';
      if (hasSidebarHref || hasSidebarTestId) {
        if (hideElementForFeature(navItem, 'grok')) {
          foundElements++;
          console.log('Hidden text-based Grok element:', navItem);
        }
      }
    });

    console.log(`Total Grok elements hidden: ${foundElements}`);
    this.isProcessing = false;
  }

  restoreGrok() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    restoreElementsForFeature('grok');

    this.isProcessing = false;
  }
}

// Twitter Bird Restorer
class TwitterBirdRestorer {
  constructor() {
    this.isProcessing = false;
  }

  updateComposeButtonLabels(fromLabel, toLabel) {
    const composeButtons = document.querySelectorAll(
      'button[data-testid="tweetButtonInline"], ' +
      'a[data-testid="SideNav_NewTweet_Button"], ' +
      'button[aria-label="Post"], a[aria-label="Post"]'
    );
    let updatedLabels = 0;

    composeButtons.forEach(button => {
      const walker = document.createTreeWalker(button, NodeFilter.SHOW_TEXT);
      let textNode;
      while ((textNode = walker.nextNode())) {
        const parent = textNode.parentElement;
        if (!parent || parent.closest('svg')) continue;

        if (fromLabel === 'Post' && textNode.nodeValue?.trim() === fromLabel) {
          if (!parent.hasAttribute('data-xplus-original-post-label')) {
            parent.setAttribute('data-xplus-original-post-label', textNode.nodeValue);
          }
          textNode.nodeValue = textNode.nodeValue.replace(fromLabel, toLabel);
          updatedLabels++;
        } else if (fromLabel === 'Tweet' && parent.hasAttribute('data-xplus-original-post-label')) {
          textNode.nodeValue = parent.getAttribute('data-xplus-original-post-label');
          parent.removeAttribute('data-xplus-original-post-label');
          updatedLabels++;
        } else if (fromLabel === 'Tweet' && textNode.nodeValue?.trim() === fromLabel) {
          textNode.nodeValue = textNode.nodeValue.replace(fromLabel, toLabel);
          updatedLabels++;
        }
      }
    });
    return updatedLabels;
  }

  updateLogoText(toLabel) {
    const logoElements = document.querySelectorAll(
      'a[aria-label="X"], h1, div[role="banner"]'
    );
    let updatedLabels = 0;

    logoElements.forEach(element => {
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      let textNode;
      while ((textNode = walker.nextNode())) {
        if (!/^[\s]*[X𝕏][\s]*$/.test(textNode.nodeValue || '')) continue;
        const parent = textNode.parentElement;
        if (!parent) continue;

        if (!parent.hasAttribute('data-xplus-original-logo-text')) {
          parent.setAttribute('data-xplus-original-logo-text', textNode.nodeValue);
        }
        textNode.nodeValue = textNode.nodeValue.replace(/[X𝕏]/, toLabel);
        updatedLabels++;
      }
    });
    return updatedLabels;
  }

  restoreLogoText() {
    document.querySelectorAll('[data-xplus-original-logo-text]').forEach(parent => {
      const originalText = parent.getAttribute('data-xplus-original-logo-text');
      const walker = document.createTreeWalker(parent, NodeFilter.SHOW_TEXT);
      let textNode;
      while ((textNode = walker.nextNode())) {
        if (textNode.nodeValue?.trim() === '🐦') {
          textNode.nodeValue = originalText;
          break;
        }
      }
      parent.removeAttribute('data-xplus-original-logo-text');
    });
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

    foundElements += this.updateLogoText('🐦');

    foundElements += this.updateComposeButtonLabels('Post', 'Tweet');

    console.log(`Total Twitter bird elements restored: ${foundElements}`);
    this.isProcessing = false;
  }

  removeTwitterBird() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    console.log('Removing Twitter bird restoration...');

    const twitterBirdSvgs = document.querySelectorAll('svg[data-original-svg]');
    twitterBirdSvgs.forEach(svg => {
      svg.innerHTML = svg.getAttribute('data-original-svg');
      svg.removeAttribute('data-original-svg');
    });

    this.restoreLogoText();
    this.updateComposeButtonLabels('Tweet', 'Post');

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
    const elements = document.querySelectorAll('div[aria-label="Timeline: Trending now"]');
    console.log(`Found ${elements.length} "What's happening" elements`);

    elements.forEach(element => {
      const section = element.closest('section[aria-labelledby]');
      const sectionWrapper = section?.parentElement;
      const target = sectionWrapper?.tagName === 'DIV' ? sectionWrapper : section || element;

      if (target.style.display !== 'none') {
        target.setAttribute('data-xplus-whats-happening-display', target.style.display);
        target.setAttribute('data-xplus-whats-happening-display-priority', target.style.getPropertyPriority('display'));
        target.style.setProperty('display', 'none', 'important');
        foundElements++;
        console.log('Hidden "What\'s happening" section:', target);
      }
    });

    console.log(`Total "What's happening" elements hidden: ${foundElements}`);
    this.isProcessing = false;
  }

  restoreWhatsHappening() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    console.log('Restoring "What\'s happening" section...');

    document.querySelectorAll('[data-xplus-whats-happening-display]').forEach(element => {
      const display = element.getAttribute('data-xplus-whats-happening-display');
      const priority = element.getAttribute('data-xplus-whats-happening-display-priority') || '';
      element.style.removeProperty('display');
      if (display) {
        element.style.setProperty('display', display, priority);
      }
      element.removeAttribute('data-xplus-whats-happening-display');
      element.removeAttribute('data-xplus-whats-happening-display-priority');
      console.log('Restored "What\'s happening" element or container:', element);
    });

    this.isProcessing = false;
  }
}

// Sidebar Navigation Customizer
class SidebarNavigationCustomizer {
  constructor() {
    this.items = new Map();
  }

  getItemId(element) {
    const testId = element.getAttribute('data-testid');
    if (testId) return testId;

    const href = element.getAttribute('href');
    if (href) {
      try {
        const path = new URL(href, window.location.href).pathname;
        return `navigation-${path.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase()}`;
      } catch (error) {
        console.warn('Unable to identify navigation link:', href, error);
      }
    }

    const label = this.getLabel(element);
    return `navigation-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  }

  getLabel(element) {
    const visibleText = element.querySelector('div[dir="ltr"] span, span')?.textContent ||
      element.innerText ||
      element.textContent;
    return (visibleText || element.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ');
  }

  getSafeHref(element) {
    const href = element.getAttribute('href');
    if (!href) return null;

    try {
      const url = new URL(href, window.location.href);
      const isXDomain = /(^|\.)x\.com$/i.test(url.hostname) || /(^|\.)twitter\.com$/i.test(url.hostname);
      if (url.protocol !== 'https:' && !(isXDomain && url.protocol === 'http:')) return null;
      return isXDomain ? `${url.pathname}${url.search}${url.hash}` : url.href;
    } catch (error) {
      console.warn('Ignoring invalid navigation link:', href, error);
      return null;
    }
  }

  getLayoutTarget(element, nav) {
    let target = element;
    let parent = element.parentElement;
    while (parent) {
      const display = getComputedStyle(parent).display;
      const isLayoutContainer = ['flex', 'inline-flex', 'grid', 'inline-grid'].includes(display);
      const targetControlCount = this.countPrimaryControls(target);
      const siblingItemCount = Array.from(parent.children).filter(child =>
        this.hasPrimaryControl(child)
      ).length;
      if (isLayoutContainer && targetControlCount === 1 && siblingItemCount > 1) {
        return target;
      }
      if (parent === nav) break;
      target = parent;
      parent = parent.parentElement;
    }
    return element;
  }

  countPrimaryControls(element) {
    const isPrimaryControl = control =>
      !control.closest('[data-testid="Dropdown"], [role="menu"], [role="dialog"]');
    return (element.matches('a[href], button') && isPrimaryControl(element) ? 1 : 0) +
      Array.from(element.querySelectorAll('a[href], button')).filter(isPrimaryControl).length;
  }

  hasPrimaryControl(element) {
    return this.countPrimaryControls(element) > 0;
  }

  collectItems(nav) {
    const found = [];
    const moreButton = nav.querySelector('[data-testid="AppTabBar_More_Menu"]');

    Array.from(nav.querySelectorAll('a[href]')).forEach((element, index) => {
      if (element.closest('[data-testid="Dropdown"], [role="menu"], [role="dialog"]')) return;
      const label = this.getLabel(element);
      const href = this.getSafeHref(element);
      if (!label || !href) return;

      const id = this.getItemId(element);
      if (found.some(item => item.href === href || item.id === id)) return;
      found.push({
        id,
        label,
        href,
        area: 'main',
        source: element,
        row: element
      });
    });
    if (moreButton) {
      found.push({
        id: 'xplus-more-menu-toggle',
        label: 'More button',
        href: null,
        area: 'main',
        kind: 'more-toggle',
        source: moreButton,
        row: moreButton
      });
    }
    found.forEach(item => {
      const layoutTarget = this.getLayoutTarget(item.source, nav);
      const nestedControls = this.countPrimaryControls(layoutTarget);
      item.layoutTarget = layoutTarget;
      item.row = nestedControls === 1 ? layoutTarget : item.source;
    });
    return found;
  }

  rememberItems(items) {
    const currentIds = new Set(items.map(item => item.id));
    this.items.forEach((_item, id) => {
      if (!currentIds.has(id)) this.items.delete(id);
    });
    items.forEach(item => {
      const previous = this.items.get(item.id);
      const row = item.row || item.source.parentElement;
      const layoutTarget = item.layoutTarget || item.source;
      const sameOriginalRow = previous?.row === row && row?.contains(item.source);
      const sameLayoutTarget = previous?.layoutTarget === layoutTarget;
      const originalOrder = sameOriginalRow
        ? previous.originalOrder
        : Array.from(layoutTarget?.parentElement?.children || []).indexOf(layoutTarget);
      this.items.set(item.id, {
        ...previous,
        ...item,
        row,
        parent: layoutTarget?.parentElement,
        layoutTarget,
        originalOrder,
        originalCssOrder: sameLayoutTarget ? previous.originalCssOrder : layoutTarget?.style.order || '',
        originalCssOrderPriority: sameLayoutTarget
          ? previous.originalCssOrderPriority
          : layoutTarget?.style.getPropertyPriority('order') || '',
        originalDisplay: sameOriginalRow ? previous.originalDisplay : row?.style.display || '',
        originalDisplayPriority: sameOriginalRow
          ? previous.originalDisplayPriority
          : row?.style.getPropertyPriority('display') || ''
      });
    });
  }

  persistInventory() {
    const inventory = Array.from(this.items.values()).map(({ id, label, href, area, target, kind }) => ({
      id,
      label,
      href,
      area,
      target,
      kind
    }));
    chrome.storage.local.set({ navigationItems: inventory }, () => {
      if (chrome.runtime.lastError) {
        console.error('Unable to save navigation inventory:', chrome.runtime.lastError);
      }
    });
  }

  getPreferences(settings) {
    const saved = new Map((settings.sidebarNavigationItems || []).map(item => [item.id, item]));
    return Array.from(this.items.values()).map((item, index) => {
      const preference = saved.get(item.id);
      const isLegacyClutter = /lists|jobs|communities|verified orgs/i.test(item.label);
      return {
        ...item,
        visible: preference?.area === 'hidden' || preference?.visible === false
          ? false
          : !(settings.removeSidebarClutter && isLegacyClutter),
        order: Number.isInteger(preference?.order) ? preference.order : index
      };
    }).sort((a, b) => a.order - b.order);
  }

  cleanupLegacyNavigation() {
    document.querySelectorAll('nav[aria-label="Primary"][data-xplus-native-nav-display]').forEach(nav => {
      nav.style.display = nav.getAttribute('data-xplus-native-nav-display');
      nav.removeAttribute('data-xplus-native-nav-display');
    });
  }

  setInlineStyle(element, property, value, priority = '') {
    if (element.style.getPropertyValue(property) === value &&
        element.style.getPropertyPriority(property) === priority) return;
    element.style.setProperty(property, value, priority);
  }

  restoreInlineStyle(element, property, value, priority = '') {
    if (value) {
      this.setInlineStyle(element, property, value, priority);
    } else if (element.style.getPropertyValue(property) || element.style.getPropertyPriority(property)) {
      element.style.removeProperty(property);
    }
  }

  render(nav, settings) {
    if (!nav.isConnected) return;
    this.rememberItems(this.collectItems(nav));
    const preferences = this.getPreferences(settings);
    preferences.forEach(item => {
      const row = item.row;
      if (!row) return;
      if (!item.visible) {
        this.setInlineStyle(row, 'display', 'none', 'important');
      } else if (row.style.display === 'none') {
        this.restoreInlineStyle(row, 'display', item.originalDisplay, item.originalDisplayPriority);
      }
    });

    const groups = new Map();
    preferences.filter(item => item.parent?.isConnected).forEach(item => {
      if (!groups.has(item.parent)) groups.set(item.parent, []);
      groups.get(item.parent).push(item);
    });
    groups.forEach(items => {
      const parent = items[0]?.parent;
      if (!parent || !['flex', 'inline-flex', 'grid', 'inline-grid'].includes(getComputedStyle(parent).display)) return;
      const targets = new Set(items.map(item => item.layoutTarget));
      if (Array.from(parent.children).some(child => !targets.has(child)) ||
          items.some(item => item.layoutTarget.parentElement !== parent)) return;

      const slots = items.map(item => item.originalOrder).sort((a, b) => a - b);
      items.sort((a, b) => a.order - b.order).forEach((item, index) => {
        this.setInlineStyle(item.layoutTarget, 'order', String(slots[index]), 'important');
      });
    });
  }

  removeSidebarClutter(settings) {
    const nav = document.querySelector('nav[aria-label="Primary"]');
    if (!nav) return;

    const previousIds = new Set(this.items.keys());
    this.rememberItems(this.collectItems(nav));
    if (previousIds.size !== this.items.size ||
        Array.from(this.items.keys()).some(id => !previousIds.has(id))) {
      this.persistInventory();
    }
    this.render(nav, settings);
  }

  restoreSidebarClutter() {
    this.cleanupLegacyNavigation();
    this.items.forEach(item => {
      const row = item.row;
      const layoutTarget = item.layoutTarget || item.source;
      if (row) {
        if (item.originalDisplay) {
          this.restoreInlineStyle(row, 'display', item.originalDisplay, item.originalDisplayPriority);
        } else {
          this.restoreInlineStyle(row, 'display', '', '');
        }
      }
      if (item.originalCssOrder) {
        this.restoreInlineStyle(layoutTarget, 'order', item.originalCssOrder, item.originalCssOrderPriority);
      } else {
        this.restoreInlineStyle(layoutTarget, 'order', '', '');
      }
    });
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

    if (hideElementForFeature(whoToFollowAside, 'whoToFollow')) {
      foundElements++;
      console.log('Hidden "Who to follow" aside:', whoToFollowAside);

      let currentParent = whoToFollowAside.parentElement;
      for (let i = 0; i < 3; i++) {
        if (currentParent && currentParent !== document.body) {
          const visibleChildren = Array.from(currentParent.children).filter(child =>
            child.style.display !== 'none' && child !== whoToFollowAside
          );

          if (visibleChildren.length === 0) {
            if (hideElementForFeature(currentParent, 'whoToFollow')) {
              foundElements++;
              console.log('Hidden empty parent container:', currentParent);
            }
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
          if (hideElementForFeature(element, 'whoToFollow')) {
            foundElements++;
            console.log('Hidden "Who to follow" element:', element);
          }
        });
      } catch (error) {
        console.error(`Unable to process "Who to follow" selector "${selector}":`, error);
      }
    });

    console.log(`Total "Who to follow" elements hidden: ${foundElements}`);
    this.isProcessing = false;
  }

  restoreWhoToFollow() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    restoreElementsForFeature('whoToFollow');

    this.isProcessing = false;
  }

  removeProfileWhoToFollow() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    console.log('Attempting to remove "Who to follow" UserCells...');

    // Need to preserve users on this page, as it is a valid user search 
    const isSearchPage = window.location.pathname.includes('/search');
    if (isSearchPage) {
      console.log('On search page - skipping UserCell removal to preserve search results');
      this.isProcessing = false;
      return;
    }

    // Check if we're on a profile page with followers/following list
    const pathname = window.location.pathname;
    const isFollowersPage = /\/[^\/]+\/(followers|following|verified_followers)$/.test(pathname);
    
    if (isFollowersPage) {
      console.log('On followers/following page - only removing sidebar "Who to follow" sections');
    }

    let foundElements = 0;

    const allUserCells = document.querySelectorAll('button[data-testid="UserCell"]');
    console.log(`Found ${allUserCells.length} total user cells`);

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

    // Find the followers/following list section to exclude from removal
    let followersFollowingSection = null;
    if (isFollowersPage) {
      // Look for the section containing the followers/following list
      const listSection = document.querySelector('section[aria-labelledby^="accessible-list-"]');
      if (listSection) {
        const h1 = listSection.querySelector('h1');
        if (h1 && (h1.textContent.includes('Followers') || h1.textContent.includes('Following') || h1.textContent.includes('Verified Followers'))) {
          followersFollowingSection = listSection;
          console.log('Found followers/following list section to preserve:', followersFollowingSection);
        }
      }
    }

    allUserCells.forEach(cell => {
      // Skip UserCells that are in the followers/following list section
      if (isFollowersPage && followersFollowingSection) {
        if (followersFollowingSection.contains(cell)) {
          console.log('Skipping UserCell in followers/following list:', cell);
          return;
        }
      }

      const cellContainer = cell.closest('div[data-testid="cellInnerDiv"]');
      if (cellContainer) {
        // Double-check: if on followers/following page, make sure it's not in the main list
        if (isFollowersPage && followersFollowingSection) {
          if (followersFollowingSection.contains(cellContainer)) {
            console.log('Skipping UserCell container in followers/following list:', cellContainer);
            return;
          }
        }
        elementsToHide.push(cellContainer);
        console.log('Added UserCell to hide:', cellContainer);
      }
    });

    whoToFollowHeadings.forEach(heading => {
      if (heading.textContent.includes('Who to follow')) {
        // Skip if this heading is in the followers/following list section
        if (isFollowersPage && followersFollowingSection && followersFollowingSection.contains(heading)) {
          console.log('Skipping "Who to follow" heading in followers/following list:', heading);
          return;
        }
        const headingContainer = heading.closest('div[data-testid="cellInnerDiv"]');
        if (headingContainer) {
          // Double-check: if on followers/following page, make sure it's not in the main list
          if (isFollowersPage && followersFollowingSection && followersFollowingSection.contains(headingContainer)) {
            console.log('Skipping "Who to follow" heading container in followers/following list:', headingContainer);
            return;
          }
          elementsToHide.push(headingContainer);
          console.log('Added "Who to follow" heading to hide:', headingContainer);
        }
      }
    });

    showMoreLinks.forEach(link => {
      // Skip if this link is in the followers/following list section
      if (isFollowersPage && followersFollowingSection && followersFollowingSection.contains(link)) {
        console.log('Skipping "Show more" link in followers/following list:', link);
        return;
      }
      const linkContainer = link.closest('div[data-testid="cellInnerDiv"]');
      if (linkContainer) {
        // Double-check: if on followers/following page, make sure it's not in the main list
        if (isFollowersPage && followersFollowingSection && followersFollowingSection.contains(linkContainer)) {
          console.log('Skipping "Show more" link container in followers/following list:', linkContainer);
          return;
        }
        elementsToHide.push(linkContainer);
        console.log('Added "Show more" link to hide:', linkContainer);
      }
    });

    spacers.forEach(spacer => {
      // Skip if this spacer is in the followers/following list section
      if (isFollowersPage && followersFollowingSection && followersFollowingSection.contains(spacer)) {
        console.log('Skipping spacer in followers/following list:', spacer);
        return;
      }
      const spacerContainer = spacer.closest('div[data-testid="cellInnerDiv"]');
      if (spacerContainer) {
        // Double-check: if on followers/following page, make sure it's not in the main list
        if (isFollowersPage && followersFollowingSection && followersFollowingSection.contains(spacerContainer)) {
          console.log('Skipping spacer container in followers/following list:', spacerContainer);
          return;
        }
        elementsToHide.push(spacerContainer);
        console.log('Added spacer to hide:', spacerContainer);
      }
    });

    console.log(`Total elements to hide: ${elementsToHide.length}`);

    elementsToHide.forEach(element => {
      if (hideElementForFeature(element, 'whoToFollowProfile')) {
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
            if (hideElementForFeature(currentParent, 'whoToFollowProfile')) {
              foundElements++;
              console.log('Hidden empty parent container:', currentParent);
            }
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
          if (hideElementForFeature(element, 'whoToFollowProfile')) {
            foundElements++;
            console.log('Hidden profile "Who to follow" element:', element);

            let currentParent = element.parentElement;
            for (let i = 0; i < 3; i++) {
              if (currentParent && currentParent !== document.body) {
                const visibleChildren = Array.from(currentParent.children).filter(child =>
                  child.style.display !== 'none' && child !== element
                );

                if (visibleChildren.length === 0) {
                  if (hideElementForFeature(currentParent, 'whoToFollowProfile')) {
                    foundElements++;
                    console.log('Hidden empty profile parent container:', currentParent);
                  }
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
        console.error(`Unable to process profile "Who to follow" selector "${selector}":`, e);
      }
    });

    console.log(`Total "Who to follow" UserCell elements hidden: ${foundElements}`);
    this.isProcessing = false;
  }

  restoreProfileWhoToFollow() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    restoreElementsForFeature('whoToFollowProfile');

    this.isProcessing = false;
  }
}

// Initialize modules
const settingsManager = new SettingsManager();
const premiumRemover = new PremiumRemover();
const grokRemover = new GrokRemover();
const sidebarNavigationCustomizer = new SidebarNavigationCustomizer();
const whoToFollowRemover = new WhoToFollowRemover();
const twitterBirdRestorer = new TwitterBirdRestorer();
const whatsHappeningRemover = new WhatsHappeningRemover();

// Apply all active features
function applyFeatures() {
  const settings = settingsManager.getSettings();
  
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
    sidebarNavigationCustomizer.removeSidebarClutter(settings);
  } else {
    sidebarNavigationCustomizer.restoreSidebarClutter();
  }
  
  if (settings.removeWhoToFollow) {
    whoToFollowRemover.removeWhoToFollow();

    whoToFollowRemover.removeProfileWhoToFollow();
  } else {
    whoToFollowRemover.restoreWhoToFollow();

    whoToFollowRemover.restoreProfileWhoToFollow();
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

}

// Set up observer for dynamic content with debouncing
let observerTimeout;
function setupObserver() {
  const observer = new MutationObserver(() => {
    // Clear previous timeout
    if (observerTimeout) {
      clearTimeout(observerTimeout);
    }
    
    // Debounce the observer to prevent spam
    observerTimeout = setTimeout(() => {
      applyFeatures();
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

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'local' || !changes.settings?.newValue) return;
  const newSettings = changes.settings.newValue;
  settingsManager.settings = { ...settingsManager.getSettings(), ...newSettings };
  applyFeatures();
});

// Initialize the extension
async function init() {
  console.log('X+ (Twitter+) initialized');
  try {
    await settingsManager.loadSettings();
  } catch (error) {
    console.error('Extension settings could not be loaded; using defaults for this page:', error);
  }
  setupObserver();
  applyFeatures();
}

// Run when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
