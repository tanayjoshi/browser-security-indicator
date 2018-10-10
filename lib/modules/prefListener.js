
function PrefListener(branch_name, callback) {
    var {Cc, Ci} = require('chrome');
    var prefService = Cc["@mozilla.org/preferences-service;1"]
        .getService(Ci.nsIPrefService);
    var self = this;
    this.branch = prefService.getBranch(branch_name);
    this.branch.QueryInterface(Ci.nsIPrefBranch2);
    this.callback = callback;

    this.observe = function(subject, topic, data) {
        if (topic == 'nsPref:changed'){
            self.callback(self.branch, data);
        }
    };
    
    this.register = function(trigger) {
        self.branch.addObserver('', self, false);
        if (trigger) {
            var that = self;
            self.branch.getChildList('', {}).
                forEach(function (pref_leaf_name)
                { that.callback(that.branch, pref_leaf_name); });
        }
    };

    this.unregister = function() {
        if (self.branch)
            self.branch.removeObserver('', self);
    };
}

exports.PrefListener = PrefListener;