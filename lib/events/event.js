var util = require('util');
var ScaleManager = require('../manager/scaleManager');

var Event = function(app) {
	this.app = app;
};

module.exports = Event;

Event.prototype.start_all = function() {
 	var conditions = this.app.get('conditions');
 	var scaleManager = new ScaleManager(this.app, conditions);
 	scaleManager.start();
};