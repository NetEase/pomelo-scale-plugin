var utils = require('../util/utils');

module.exports = function(app, opts) {
  return new Component(app, opts);
};

var Component = function(app, opts) {
	this.opts = opts || {};
	app.set('conditions', opts);
};

var pro = Component.prototype;

pro.name = '__scale__';