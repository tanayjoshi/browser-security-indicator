//Partly based on SSLPersonas, originally written by Tobias Stockinger - tobi@tobitobi.de

(function() { 
  'use strict';
  var lastSSLStatus;
  var {viewFor} = require("sdk/view/core");
  var themeSwitcher = require('./modules/themeSwitcher').themeSwitcher;
  var sslHandler = require('./modules/sslHandler').SSLHandler;
  var data = require('sdk/self').data;

  function chromeInteractionCallback(window) {
    var sslStatus = sslHandler.getSSLStatus(window);
    var newTheme;
    
    if (lastSSLStatus != sslStatus) {
      lastSSLStatus = sslStatus;
      newTheme = themeSwitcher.theme[sslStatus];
      themeSwitcher.switchToTheme(newTheme);
    }
  }


  function initTabListeners() {
    var tabs = require('sdk/tabs');

    var handledEvents = [
      'ready',
      'activate'
    ];
    var eventCount = handledEvents.length; 

    for (var i = 0; i < eventCount; i++) {
      (function(event) {
        tabs.on(event, function(tab) {
          var window = viewFor(tab.window);
          chromeInteractionCallback(window);
        });
        tabs.on('close', function(tab) {
          var windows = require('sdk/windows').browserWindows;
          var reason = 'tab closed';
          
        });
      })(handledEvents[i]);
    }
  }

  function initWindowListeners() {
    var windows = require('sdk/windows').browserWindows;
    windows.on('activate', function(window) {
      var domWindow = viewFor(window);
      chromeInteractionCallback(domWindow);
    });

    windows.on('close', function() {
      var openWindows = require('sdk/windows').browserWindows;
      var reason = 'last window closed';
      if (openWindows.length == 0) {
        //themeSwitcher.cleanUpThemes(reason);
      }
    })
  }

  function addActionButton() {
    var {ActionButton} = require('sdk/ui/button/action');
    var tabs = require('sdk/tabs');

    function clickCallback(state) {
      require('sdk/window/utils').getMostRecentBrowserWindow().BrowserOpenAddonsMgr('addons://detail/' + encodeURIComponent(require('sdk/self').id));
    }

    ActionButton({
      id: 'button',
      label: 'Security Bar',
      icon: {
        16: data.url('img/icon/black-icon.png')
      },
      onClick: clickCallback
    });
  }


  function registerUnloadCallbacks() {
    function unloadCallback(reasonString) {
      var cleanupReasons = [
        'uninstall',
        'disable',
        'shutdown'
      ];
      if (cleanupReasons.indexOf(reasonString)) {
        themeSwitcher.cleanUpThemes('unloadCallback ' + reasonString);
      }
    }

    try {
      var unload = require('sdk/system/unload');
      unload.when(unloadCallback);
    }
    catch (e) {
      // console.log('Unload callbacks not available.');
    }

  }

  addActionButton();
  initTabListeners();
  initWindowListeners();
  registerUnloadCallbacks();
})();