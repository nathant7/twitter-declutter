// Popup script for X+ (Twitter+)
document.addEventListener('DOMContentLoaded', function() {
  const premiumAdsToggle = document.getElementById('premiumAdsToggle');
  const grokToggle = document.getElementById('grokToggle');
  const whoToFollowToggle = document.getElementById('whoToFollowToggle');
  const twitterBirdToggle = document.getElementById('twitterBirdToggle');
  const whatsHappeningToggle = document.getElementById('whatsHappeningToggle');
  const configureNavigationButton = document.getElementById('configureNavigationButton');
  const navigationCustomizer = document.getElementById('navigationCustomizer');
  const navigationItemsList = document.getElementById('navigationItemsList');
  const restoreNavigationButton = document.getElementById('restoreNavigationButton');
  let navigationConfig = [];
  let navigationInventory = [];
  let currentSettings = {};

  function setSwitchState(toggle, enabled) {
    toggle.classList.toggle('active', enabled);
    toggle.setAttribute('aria-checked', String(enabled));
  }

  function syncSettingsControls(settings) {
    currentSettings = settings;
    [
      [premiumAdsToggle, 'removePremiumAds'],
      [grokToggle, 'removeGrok'],
      [whoToFollowToggle, 'removeWhoToFollow'],
      [twitterBirdToggle, 'restoreTwitterBird'],
      [whatsHappeningToggle, 'removeWhatsHappening']
    ].forEach(([toggle, setting]) => setSwitchState(toggle, Boolean(settings[setting])));
    document.getElementById('extensionTitle').textContent =
      settings.restoreTwitterBird ? 'Twitter+' : 'X+';
  }

  function persistSettings(settings, context) {
    chrome.storage.local.set({ settings }, function() {
      if (chrome.runtime.lastError) {
        console.error(`Unable to save ${context}:`, chrome.runtime.lastError);
      }
    });
  }

  function saveAndApplySetting(name, value) {
    currentSettings = { ...currentSettings, [name]: value };
    persistSettings(currentSettings, `setting "${name}"`);

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (chrome.runtime.lastError) {
        console.error('Unable to find the active tab:', chrome.runtime.lastError);
        return;
      }

      const tab = tabs[0];
      if (!tab?.id || !tab.url || !/(^|\.)((x|twitter)\.com)$/.test(new URL(tab.url).hostname)) return;

      chrome.tabs.sendMessage(tab.id, {
        action: 'updateSettings',
        settings: { [name]: value }
      }, function() {
        if (chrome.runtime.lastError) {
          console.debug(`Setting "${name}" will apply when the page is available:`, chrome.runtime.lastError.message);
        }
      });
    });
  }

  function bindFeatureToggle(toggle, setting, onChange = () => {}) {
    toggle.addEventListener('click', function() {
      const enabled = !toggle.classList.contains('active');
      setSwitchState(toggle, enabled);
      onChange(enabled);
      saveAndApplySetting(setting, enabled);
    });
  }

  configureNavigationButton.addEventListener('click', function() {
    const isOpen = navigationCustomizer.classList.toggle('open');
    configureNavigationButton.setAttribute('aria-expanded', String(isOpen));
    if (isOpen && !currentSettings.removeSidebarClutter) {
      currentSettings = { ...currentSettings, removeSidebarClutter: true };
      persistSettings(currentSettings, 'sidebar customization settings');
    }
  });

  function saveNavigationConfig() {
    navigationConfig = navigationConfig.map((item, order) => ({ ...item, order }));
    currentSettings = {
      ...currentSettings,
      removeSidebarClutter: true,
      sidebarNavigationItems: navigationConfig.map(item => ({
        id: item.id,
        kind: item.kind,
        area: item.area,
        visible: item.area !== 'hidden',
        order: item.order
      }))
    };
    persistSettings(currentSettings, 'navigation settings');
  }

  restoreNavigationButton.addEventListener('click', function() {
    navigationConfig = navigationInventory.map((item, order) => ({
      id: item.id,
      label: item.label,
      href: item.href,
      kind: item.kind,
      area: 'main',
      order
    }));
    renderNavigationItems(navigationInventory, currentSettings, false);
    saveNavigationConfig();
  });

  function getUnavailableReason(item, settings) {
    const identity = `${item.id} ${item.href || ''} ${item.label}`.toLowerCase();
    if (settings.removeGrok && (identity.includes('grok') || identity.includes('/i/grok'))) {
      return 'Hidden by Remove Grok';
    }
    if (settings.removePremiumAds &&
        (identity.includes('premium') || identity.includes('premium_sign_up'))) {
      return 'Hidden by Remove Premium Ads';
    }
    return '';
  }

  function getEffectiveArea(item, settings) {
    return getUnavailableReason(item, settings) ? 'hidden' : item.area;
  }

  function refreshNavigationAvailability(settings) {
    navigationItemsList.querySelectorAll('.nav-item-row').forEach(row => {
      const item = navigationConfig.find(configItem => configItem.id === row.dataset.navigationItemId);
      if (!item) return;

      const reason = getUnavailableReason(item, settings);
      let status = row.querySelector('.nav-item-status');
      if (reason && !status) {
        status = document.createElement('span');
        status.className = 'nav-item-status';
        row.querySelector('.nav-item-details').appendChild(status);
      } else if (!reason && status) {
        status.remove();
      }
      if (status) status.textContent = reason;

      const button = row.querySelector('.nav-item-visibility');
      button.disabled = Boolean(reason);
      const action = getEffectiveArea(item, settings) === 'hidden' ? 'Show' : 'Hide';
      button.title = reason ? `${item.label} cannot be shown: ${reason}` : `${action} ${item.label}`;
      button.setAttribute(
        'aria-label',
        reason ? `${item.label} cannot be shown: ${reason}` : `${action} ${item.label} in sidebar`
      );
    });
  }

  function renderNavigationItems(inventory, settings, refreshConfig = true) {
    currentSettings = settings;
    navigationInventory = inventory;
    if (refreshConfig) {
      const savedItems = new Map((settings.sidebarNavigationItems || []).map(item => [item.id, item]));
      navigationConfig = inventory.map((item, order) => {
        const saved = savedItems.get(item.id);
        const isLegacyClutter = /lists|jobs|communities|verified orgs/i.test(item.label);
        return {
          id: item.id,
          label: item.label,
          href: item.href,
          kind: item.kind,
          area: saved?.area === 'hidden' || saved?.visible === false
            ? 'hidden'
            : (settings.removeSidebarClutter && isLegacyClutter ? 'hidden' : 'main'),
          order: Number.isInteger(saved?.order) ? saved.order : order
        };
      }).sort((a, b) => a.order - b.order);
    }

    navigationItemsList.replaceChildren();
    if (!navigationConfig.length) {
      const empty = document.createElement('p');
      empty.className = 'nav-customizer-empty';
      empty.textContent = 'Open X in this tab to load sidebar items.';
      navigationItemsList.appendChild(empty);
      return;
    }

    [
      ['main', 'Sidebar'],
      ['hidden', 'Hidden']
    ].forEach(([areaName, title]) => {
      const groupItems = navigationConfig.filter(item => getEffectiveArea(item, settings) === areaName);
      const group = document.createElement('section');
      group.className = 'nav-item-group';
      const heading = document.createElement('h3');
      heading.className = 'nav-item-group-title';
      heading.textContent = `${title} (${groupItems.length})`;
      group.appendChild(heading);
      const itemList = document.createElement('div');
      itemList.className = 'nav-item-list';
      itemList.dataset.area = areaName;

      groupItems.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'nav-item-row';
        row.dataset.navigationItemId = item.id;

        const itemDetails = document.createElement('span');
        itemDetails.className = 'nav-item-details';
        const label = document.createElement('span');
        label.className = 'nav-item-label';
        label.textContent = item.label;
        itemDetails.appendChild(label);
        row.appendChild(itemDetails);

        const visibilityButton = document.createElement('button');
        visibilityButton.type = 'button';
        visibilityButton.className = 'nav-item-visibility';
        const isHidden = getEffectiveArea(item, settings) === 'hidden';
        const unavailableReason = getUnavailableReason(item, settings);
        if (unavailableReason) row.classList.add('nav-item-unavailable');
        visibilityButton.innerHTML = isHidden
          ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 5.2A10.8 10.8 0 0112 5c5 0 8.5 4.5 9.5 7-.4 1.1-1.2 2.2-2.2 3.2M6.2 6.2C3.8 7.8 2.7 10 2.5 12c.5 1.3 1.4 2.6 2.6 3.6A10.5 10.5 0 0012 19c1.3 0 2.5-.3 3.6-.8" /></svg>'
          : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z" /><circle cx="12" cy="12" r="3" /></svg>';
        visibilityButton.title = `${isHidden ? 'Show' : 'Hide'} ${item.label}`;
        visibilityButton.setAttribute('aria-label', `${isHidden ? 'Show' : 'Hide'} ${item.label} in sidebar`);
        visibilityButton.setAttribute('aria-pressed', String(isHidden));
        visibilityButton.disabled = Boolean(unavailableReason);
        visibilityButton.addEventListener('click', function() {
          const configItem = navigationConfig.find(candidate => candidate.id === item.id);
          if (!configItem) return;
          configItem.area = isHidden ? 'main' : 'hidden';
          renderNavigationItems(inventory, currentSettings, false);
          saveNavigationConfig();
        });
        row.appendChild(visibilityButton);

        if (areaName === 'main') ['up', 'down'].forEach(direction => {
          const itemId = item.id;
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'nav-item-control';
          button.textContent = direction === 'up' ? '↑' : '↓';
          button.setAttribute('aria-label', `${direction === 'up' ? 'Move up' : 'Move down'} ${item.label} within ${title}`);
          button.disabled = direction === 'up' ? index === 0 : index === groupItems.length - 1;
          button.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            const currentGroupItems = navigationConfig.filter(configItem =>
              getEffectiveArea(configItem, currentSettings) === areaName
            );
            const currentGroupIndex = currentGroupItems.findIndex(configItem => configItem.id === itemId);
            const otherItem = currentGroupItems[currentGroupIndex + (direction === 'up' ? -1 : 1)];
            if (!otherItem) return;
            const currentIndex = navigationConfig.findIndex(configItem => configItem.id === itemId);
            const otherIndex = navigationConfig.indexOf(otherItem);
            [navigationConfig[currentIndex], navigationConfig[otherIndex]] = [navigationConfig[otherIndex], navigationConfig[currentIndex]];
            const rowsById = new Map(Array.from(itemList.children, rowElement => [
              rowElement.dataset.navigationItemId,
              rowElement
            ]));
            navigationConfig.filter(configItem =>
              getEffectiveArea(configItem, currentSettings) === areaName
            ).forEach((configItem, groupIndex) => {
              const itemRow = rowsById.get(configItem.id);
              if (!itemRow) return;
              itemList.appendChild(itemRow);
              const controls = itemRow.querySelectorAll('.nav-item-control');
              controls[0].disabled = groupIndex === 0;
              controls[1].disabled = groupIndex === itemList.children.length - 1;
            });
            saveNavigationConfig();
          });
          row.appendChild(button);
        });
        itemList.appendChild(row);
      });

      group.appendChild(itemList);
      navigationItemsList.appendChild(group);
    });
    refreshNavigationAvailability(settings);
  }

  // Load current settings from storage
  chrome.storage.local.get(['settings', 'navigationItems'], function(result) {
    if (chrome.runtime.lastError) {
      console.error('Unable to load extension settings:', chrome.runtime.lastError);
      return;
    }
    const navigationInventory = (result.navigationItems || []).filter(item => item.area !== 'more');
    const settings = result.settings || {};
    syncSettingsControls(settings);
    renderNavigationItems(navigationInventory, settings);
  });

  chrome.storage.onChanged.addListener(function(changes, areaName) {
    if (areaName === 'local' && changes.settings?.newValue) {
      syncSettingsControls(changes.settings.newValue);
      renderNavigationItems(navigationInventory, currentSettings);
    }
    if (areaName === 'local' && changes.navigationItems) {
      navigationInventory = (changes.navigationItems.newValue || []).filter(item => item.area !== 'more');
      renderNavigationItems(navigationInventory, currentSettings);
    }
  });

  bindFeatureToggle(premiumAdsToggle, 'removePremiumAds');
  bindFeatureToggle(grokToggle, 'removeGrok');
  bindFeatureToggle(whoToFollowToggle, 'removeWhoToFollow');
  bindFeatureToggle(twitterBirdToggle, 'restoreTwitterBird', enabled => {
    document.getElementById('extensionTitle').textContent = enabled ? 'Twitter+' : 'X+';
  });
  bindFeatureToggle(whatsHappeningToggle, 'removeWhatsHappening');

});
