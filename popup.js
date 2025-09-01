// Popup script for Twitter Declutter
document.addEventListener('DOMContentLoaded', function() {
  const premiumAdsToggle = document.getElementById('premiumAdsToggle');
  const grokToggle = document.getElementById('grokToggle');
  const sidebarClutterToggle = document.getElementById('sidebarClutterToggle');
  const whoToFollowToggle = document.getElementById('whoToFollowToggle');
  const profileFeaturesToggle = document.getElementById('profileFeaturesToggle');
  const twitterBirdToggle = document.getElementById('twitterBirdToggle');
  const whatsHappeningToggle = document.getElementById('whatsHappeningToggle');

  // Load current settings from storage
  chrome.storage.local.get(['settings'], function(result) {
    if (result.settings) {
      if (result.settings.removePremiumAds !== undefined) {
        premiumAdsToggle.classList.toggle('active', result.settings.removePremiumAds);
      }
      if (result.settings.removeGrok !== undefined) {
        grokToggle.classList.toggle('active', result.settings.removeGrok);
      }
      if (result.settings.removeSidebarClutter !== undefined) {
        sidebarClutterToggle.classList.toggle('active', result.settings.removeSidebarClutter);
      }
      if (result.settings.removeWhoToFollow !== undefined) {
        whoToFollowToggle.classList.toggle('active', result.settings.removeWhoToFollow);
      }
      if (result.settings.removeProfileFeatures !== undefined) {
        profileFeaturesToggle.classList.toggle('active', result.settings.removeProfileFeatures);
      }
             if (result.settings.restoreTwitterBird !== undefined) {
         twitterBirdToggle.classList.toggle('active', result.settings.restoreTwitterBird);
         
         // Set the title based on the saved state
         const titleElement = document.getElementById('extensionTitle');
         if (result.settings.restoreTwitterBird) {
           titleElement.textContent = 'Twitter 4 U';
           titleElement.classList.add('twitter-mode');
         } else {
           titleElement.textContent = 'X 4 U';
           titleElement.classList.remove('twitter-mode');
         }
       }
       if (result.settings.removeWhatsHappening !== undefined) {
         whatsHappeningToggle.classList.toggle('active', result.settings.removeWhatsHappening);
       }
    }
  });

  // Handle premium ads toggle
  premiumAdsToggle.addEventListener('click', function() {
    const isActive = premiumAdsToggle.classList.contains('active');
    const newState = !isActive;
    
    premiumAdsToggle.classList.toggle('active', newState);
    
    // Save to storage
    chrome.storage.local.get(['settings'], function(result) {
      const currentSettings = result.settings || {};
      currentSettings.removePremiumAds = newState;
      chrome.storage.local.set({ settings: currentSettings });
    });
    
    // Send updated settings to content script
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0] && tabs[0].url && (tabs[0].url.includes('twitter.com') || tabs[0].url.includes('x.com'))) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'updateSettings',
          settings: { removePremiumAds: newState }
        }, function(response) {
          if (chrome.runtime.lastError) {
            console.log('Error sending message:', chrome.runtime.lastError);
          } else {
            console.log('Settings updated successfully');
          }
        });
      }
    });
  });

  // Handle grok toggle
  grokToggle.addEventListener('click', function() {
    const isActive = grokToggle.classList.contains('active');
    const newState = !isActive;
    
    grokToggle.classList.toggle('active', newState);
    
    // Save to storage
    chrome.storage.local.get(['settings'], function(result) {
      const currentSettings = result.settings || {};
      currentSettings.removeGrok = newState;
      chrome.storage.local.set({ settings: currentSettings });
    });
    
    // Send updated settings to content script
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0] && tabs[0].url && (tabs[0].url.includes('twitter.com') || tabs[0].url.includes('x.com'))) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'updateSettings',
          settings: { removeGrok: newState }
        }, function(response) {
          if (chrome.runtime.lastError) {
            console.log('Error sending message:', chrome.runtime.lastError);
          } else {
            console.log('Settings updated successfully');
          }
        });
      }
    });
  });

  // Handle sidebar clutter toggle
  sidebarClutterToggle.addEventListener('click', function() {
    const isActive = sidebarClutterToggle.classList.contains('active');
    const newState = !isActive;
    
    sidebarClutterToggle.classList.toggle('active', newState);
    
    // Save to storage
    chrome.storage.local.get(['settings'], function(result) {
      const currentSettings = result.settings || {};
      currentSettings.removeSidebarClutter = newState;
      chrome.storage.local.set({ settings: currentSettings });
    });
    
    // Send updated settings to content script
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0] && tabs[0].url && (tabs[0].url.includes('twitter.com') || tabs[0].url.includes('x.com'))) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'updateSettings',
          settings: { removeSidebarClutter: newState }
        }, function(response) {
          if (chrome.runtime.lastError) {
            console.log('Error sending message:', chrome.runtime.lastError);
          } else {
            console.log('Settings updated successfully');
          }
        });
      }
    });
  });

  // Handle who to follow toggle
  whoToFollowToggle.addEventListener('click', function() {
    const isActive = whoToFollowToggle.classList.contains('active');
    const newState = !isActive;
    
    whoToFollowToggle.classList.toggle('active', newState);
    
    // Save to storage
    chrome.storage.local.get(['settings'], function(result) {
      const currentSettings = result.settings || {};
      currentSettings.removeWhoToFollow = newState;
      chrome.storage.local.set({ settings: currentSettings });
    });
    
    // Send updated settings to content script
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0] && tabs[0].url && (tabs[0].url.includes('twitter.com') || tabs[0].url.includes('x.com'))) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'updateSettings',
          settings: { removeWhoToFollow: newState }
        }, function(response) {
          if (chrome.runtime.lastError) {
            console.log('Error sending message:', chrome.runtime.lastError);
          } else {
            console.log('Settings updated successfully');
          }
        });
      }
    });
  });

  // Handle profile features toggle
  profileFeaturesToggle.addEventListener('click', function() {
    const isActive = profileFeaturesToggle.classList.contains('active');
    const newState = !isActive;
    
    profileFeaturesToggle.classList.toggle('active', newState);
    
    // Save to storage
    chrome.storage.local.get(['settings'], function(result) {
      const currentSettings = result.settings || {};
      currentSettings.removeProfileFeatures = newState;
      chrome.storage.local.set({ settings: currentSettings });
    });
    
    // Send updated settings to content script
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0] && tabs[0].url && (tabs[0].url.includes('twitter.com') || tabs[0].url.includes('x.com'))) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'updateSettings',
          settings: { removeProfileFeatures: newState }
        }, function(response) {
          if (chrome.runtime.lastError) {
            console.log('Error sending message:', chrome.runtime.lastError);
          } else {
            console.log('Settings updated successfully');
          }
        });
      }
    });
  });

  // Handle twitter bird toggle
  twitterBirdToggle.addEventListener('click', function() {
    const isActive = twitterBirdToggle.classList.contains('active');
    const newState = !isActive;
    
    twitterBirdToggle.classList.toggle('active', newState);
    
    // Animate the title change
    const titleElement = document.getElementById('extensionTitle');
    if (newState) {
      // Change to Twitter mode
      titleElement.textContent = 'Twitter 4 U';
      titleElement.classList.add('twitter-mode');
    } else {
      // Change back to X mode
      titleElement.textContent = 'X 4 U';
      titleElement.classList.remove('twitter-mode');
    }
    
    // Save to storage
    chrome.storage.local.get(['settings'], function(result) {
      const currentSettings = result.settings || {};
      currentSettings.restoreTwitterBird = newState;
      chrome.storage.local.set({ settings: currentSettings });
    });
    
    // Send updated settings to content script
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0] && tabs[0].url && (tabs[0].url.includes('twitter.com') || tabs[0].url.includes('x.com'))) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'updateSettings',
          settings: { restoreTwitterBird: newState }
        }, function(response) {
          if (chrome.runtime.lastError) {
            console.log('Error sending message:', chrome.runtime.lastError);
          } else {
            console.log('Settings updated successfully');
          }
        });
      }
    });
  });

  // Handle whats happening toggle
  whatsHappeningToggle.addEventListener('click', function() {
    const isActive = whatsHappeningToggle.classList.contains('active');
    const newState = !isActive;
    
    whatsHappeningToggle.classList.toggle('active', newState);
    
    // Save to storage
    chrome.storage.local.get(['settings'], function(result) {
      const currentSettings = result.settings || {};
      currentSettings.removeWhatsHappening = newState;
      chrome.storage.local.set({ settings: currentSettings });
    });
    
    // Send updated settings to content script
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0] && tabs[0].url && (tabs[0].url.includes('twitter.com') || tabs[0].url.includes('x.com'))) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'updateSettings',
          settings: { removeWhatsHappening: newState }
        }, function(response) {
          if (chrome.runtime.lastError) {
            console.log('Error sending message:', chrome.runtime.lastError);
          } else {
            console.log('Settings updated successfully');
          }
        });
      }
    });
  });

  // Secret title click handler
  const titleElement = document.getElementById('extensionTitle');
  titleElement.addEventListener('click', function() {
    // Toggle the twitter bird feature
    const isActive = twitterBirdToggle.classList.contains('active');
    const newState = !isActive;
    
    // Update the toggle switch
    twitterBirdToggle.classList.toggle('active', newState);
    
    // Animate the title change
    if (newState) {
      // Change to Twitter mode
      titleElement.textContent = 'Twitter 4 U';
      titleElement.classList.add('twitter-mode');
    } else {
      // Change back to X mode
      titleElement.textContent = 'X 4 U';
      titleElement.classList.remove('twitter-mode');
    }
    
    // Save to storage
    chrome.storage.local.get(['settings'], function(result) {
      const currentSettings = result.settings || {};
      currentSettings.restoreTwitterBird = newState;
      chrome.storage.local.set({ settings: currentSettings });
    });
    
    // Send updated settings to content script
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0] && tabs[0].url && (tabs[0].url.includes('twitter.com') || tabs[0].url.includes('x.com'))) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'updateSettings',
          settings: { restoreTwitterBird: newState }
        }, function(response) {
          if (chrome.runtime.lastError) {
            console.log('Error sending message:', chrome.runtime.lastError);
          } else {
            console.log('Settings updated successfully');
          }
        });
      }
    });
  });
});
