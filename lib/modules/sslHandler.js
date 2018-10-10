
function SSLHandler() {
  this.SSL_STATUS = {
    extendedValidation: 'extendedValidation',
    standardValidation: 'standardValidation',
    brokenCertificate: 'brokenCertificate',
    insecureConnection: 'insecureConnection',
    otherProtocol: 'otherProtocol'
  };

  this.getSSLStatus = function(window) {
    var progressListener, tabTitle;
    var utils = require('sdk/window/utils');
    var {modelFor} = require('sdk/model/core');

    var activeWindow = window || browser.windows.getLastFocused();

    if('getBrowser' in activeWindow) {
      var securityUI = activeWindow.getBrowser().securityUI;

      progress = require('chrome').Ci.nsIWebProgressListener;
      if (!securityUI.SSLStatus) {
        return this.SSL_STATUS.insecureConnection;
      }
      else {
        var {NotValidAtThisTime, Untrusted, ExtendedValidation, DomainMismatch} = securityUI.SSLStatus;

        if (NotValidAtThisTime || DomainMismatch || progress.STATE_IS_BROKEN & securityUI.state) {
          return this.SSL_STATUS.brokenCertificate;
        }

        if (ExtendedValidation) {
          return this.SSL_STATUS.extendedValidation;
        }

        return Untrusted ? this.SSL_STATUS.brokenCertificate : this.SSL_STATUS.standardValidation;
      }
    }
  }
}

exports.SSLHandler = new SSLHandler();
