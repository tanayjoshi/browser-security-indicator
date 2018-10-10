'use strict';

function themeSwitcher(){

    var {Cu} = require('chrome');
    var sslStatus = require('./sslHandler').SSLHandler.SSL_STATUS;
    var PrefListener = require('./prefListener').PrefListener;
    var simpleStorage = require('sdk/simple-storage');
    var simplePrefs = require('sdk/simple-prefs');
    var data = require('sdk/self').data;
    var cleanupReasons = {
        standardActive : 'standardActive'
    };

    var ThemeIds = ['ev','sv','http','https','sslp_standard'];

    var themeChangedListener = new PrefListener(
        "lightweightThemes.",
        function(branch, name) {
            switch (name) {
                case "lightweight-theme-changed":
                case "persisted.headerURL":
                case "isThemeSelected":
                    this.ensureCustomTheme();
                    break;
                case "lightweight-theme-change-requested":
                    break;
                case "usedThemes":
                    break;
                default:
                    break;
            }
        }
    );

    Cu.import('resource://gre/modules/LightweightThemeManager.jsm');

    this.theme = {};
    this.theme.defaultTheme = simpleStorage.storage.userTheme || new Theme();
    this.theme[sslStatus.extendedValidation] = new Theme('ev','Extended Validation Certificate Theme', data.url('img/themes/extendedValidation.png'));
    this.theme[sslStatus.standardValidation] = new Theme('sv','Standard Validation Certificate Theme', data.url('img/themes/standardValidation.png'));

    resetInsecureConnectionTheme();

    this.theme[sslStatus.brokenCertificate] = new Theme('https','Broken Certificate Theme', data.url('img/themes/brokenCertificate.png'));
    this.theme[sslStatus.otherProtocol] = simpleStorage.storage.userTheme || new Theme();

    this.switchToTheme = function(theme){
        if(theme && typeof theme  != 'undefined'){
            LightweightThemeManager.themeChanged(theme);
            if(theme.id == this.theme.defaultTheme.id){
                this.cleanUpThemes(cleanupReasons.standardActive);
            }
        }
    };

    this.cleanUpThemes = function(reason){
        if(typeof reason == 'undefined' || reason != cleanupReasons.standardActive){
            try{
                LightweightThemeManager.themeChanged(simpleStorage.storage.userTheme);
            }
        }

        for(var i=0;i<ThemeIds.length;i++){
            (function(id){
                if(typeof id != 'undefined'){
                    try{
                        LightweightThemeManager.forgetUsedTheme(id);
                    }
                    catch(e){
                        console.warn("Could not clean up properly");
                    }
                }
            })(ThemeIds[i]);
        }
    };

    this.ensureCustomTheme = function(){
        var previousTheme = LightweightThemeManager.currentTheme;
        if(previousTheme != null && typeof previousTheme != 'undefined'){
            if(previousTheme.id == this.theme.defaultTheme.id){
                return;
            }

            if(ThemeIds.indexOf(previousTheme.id) == -1){
                simpleStorage.storage.userTheme = previousTheme;
                this.theme.defaultTheme = previousTheme;
                this.theme[sslStatus.otherProtocol] = previousTheme;
            }
            else{
            }
        }
        else    {
            delete simpleStorage.storage.userTheme;
            this.theme.defaultTheme = new Theme();
            this.theme[sslStatus.otherProtocol] = new Theme();
        }
    };

    function Theme(id,name,headerURL){
        var additionalInfo = 'Security Bar: ';
        this.id = id || 'sslp_standard';
        this.name = additionalInfo + ": " + (name || 'Standard Theme');

        this.headerURL = headerURL;
        this.footerURL = headerURL; 
        this.author = additionalInfo;
    }

    function resetInsecureConnectionTheme(){
        switch (simplePrefs.prefs.insecureTheme){
            case 'yellow':
                this.theme[sslStatus.insecureConnection] = new Theme('http',
                    'Insecure Connection Theme',
                    data.url('img/themes/insecureConnection_yellow.png'));
                break;
            case 'red':
                this.theme[sslStatus.insecureConnection] = new Theme('http',
                    'Insecure Connection Theme',
                    data.url('img/themes/insecureConnection_red.png'));
                break;
            default:
                this.theme[sslStatus.insecureConnection] = simpleStorage.storage.userTheme || new Theme();
                break;
        }
    }

    themeChangedListener.register(true);

    simplePrefs.on("insecureTheme", function(preferenceName){
        resetInsecureConnectionTheme();
    });

}

exports.themeSwitcher = new themeSwitcher();