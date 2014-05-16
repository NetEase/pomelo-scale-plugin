var util = require('util');
var async = require('async');
var exec = require('child_process').exec;
var starter = require('../util/starter');
var logger = require('pomelo-logger').getLogger('pomelo-scale-plugin', __filename);

var DEFAULT_INCREASE = 1;
var DEFAULT_INTERVAL = 5 * 60 * 1000;

var Operator = function (manager, app, condition, type) {
	this.app = app;
	this.type = type;
	this.manager = manager;
	this.condition = condition;
	this.run = condition.run || runners[type];
	this.interval = condition.interval || DEFAULT_INTERVAL;
	this.increasement = condition.increasement || DEFAULT_INCREASE;
};

module.exports = Operator;

var pro = Operator.prototype;

pro.start = function() {
	var self = this;
	setInterval(function() {
		self.schedule();
	}, this.interval);
};

pro.schedule = function() {
	var self = this;
	for(var key in this.condition)	{
		var servers = this.app.getServersByType(key);
		if(!!servers && !!servers.length) {
			(function(key) {
				async.map(servers, function(server, callback) {
					self.run(server.pid, function(err, data) {
						callback(err, data);
					});
				}, function(err, results) {
					if(!!err)	{
						logger.error('check server with error, err: %j', err.stack);
						return;
					}
					self.scale(key, results);
				});
			})(key);
		}
	}
};

pro.scale = function(type, results) {
	var total = 0;
	for(var i=0; i<results.length; i++)	{
		total += Number(results[i]);
	}
	var average = Math.round(total/results.length);
	if(average > this.condition[type]) {
		var servers = this.manager.getAvailableServers(type, this.increasement);
		if(!!servers)	{
			for(var j=0; j<servers.length; j++)	{
				servers[j].serverType = type;
				starter.run(this.app, servers[j]);
			}
		}
	}
};

var cpuRunner = function(pid, cb) {
	var child = exec("ps aux|grep " + pid + "|grep -v grep|awk '{print $3}'", function(error, stdout, stderr)	{
    cb(error, stdout.slice(0, -1));
	});
};

var memoryRunner = function(pid, cb) {
	var child = exec("ps aux|grep " + pid + "|grep -v grep|awk '{print $4}'", function(error, stdout, stderr)	{
    cb(error, stdout.slice(0, -1));
	});
};

var runners = {
	cpu: cpuRunner,
	memory: memoryRunner
};