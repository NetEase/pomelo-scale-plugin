var os = require('os');
var utils = module.exports;

utils.invokeCallback = function(cb) {
  if ( !! cb && typeof cb === 'function') {
    cb.apply(null, Array.prototype.slice.call(arguments, 1));
  }
};

utils.isLocal = function(host) {
  return host === '127.0.0.1' || host === 'localhost' || inLocal(host);
};

var inLocal = function(host) {
  for (var index in localIps) {
    if (host === localIps[index]) {
      return true;
    }
  }
  return false;
};

var localIps = function() {
  var ifaces = os.networkInterfaces();
  var ips = [];
  var func = function(details) {
    if (details.family === 'IPv4') {
      ips.push(details.address);
    }
  };
  for (var dev in ifaces) {
    ifaces[dev].forEach(func);
  }
  return ips;
}();