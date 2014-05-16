var util = require('util');
var utils = require('./utils');
var spawn = require('child_process').spawn;
var starter = module.exports;

starter.run = function(app, server, cb) {
  env = app.get('env');
  var cmd, key;
  if (utils.isLocal(server.host)) {
    var options = [];
    if (!!server.args) {
      if(typeof server.args === 'string') {
        options.push(server.args.trim());
      } else {
        options.push(server.args);
      }
    }
    cmd = app.get('main');
    options.push(cmd);
    options.push(util.format('env=%s',  env));
    for(key in server) {
      options.push(util.format('%s=%s', key, server[key]));
    }
    localrun(process.execPath, null, options, cb);
  } else {
    cmd = util.format('cd "%s" && "%s"', app.getBase(), process.execPath);
    var arg = server.args;
    if (arg !== undefined) {
      cmd += arg;
    }
    cmd += util.format(' "%s" env=%s ', app.get('main'), env);
    for(key in server) {
      cmd += util.format(' %s=%s ', key, server[key]);
    }
    starter.sshrun(cmd, server.host, cb);
  }
};

var sshrun = function(cmd, host, cb) {
  spawnProcess('ssh', host, [host, cmd], cb);
};


var localrun = function (cmd, host, options, callback) {
  spawnProcess(cmd, host, options, callback);
};

var spawnProcess = function(command, host, options, cb) {
  var child = null;

  if(env === 'development') {
    child = spawn(command, options);
    var prefix = command === 'ssh' ? '[' + host + '] ' : '';

    child.stderr.on('data', function (chunk) {
      var msg = chunk.toString();
      process.stderr.write(msg);
      if(!!cb) {
        cb(msg);
      }
    });

    child.stdout.on('data', function (chunk) {
      var msg = prefix + chunk.toString();
      process.stdout.write(msg);
    });
  } else {
    child = spawn(command, options, {detached: true, stdio: 'inherit'});
    child.unref();
  }

  child.on('exit', function (code) {
    if(code !== 0) {
      logger.warn('child process exit with error, error code: %s, executed command: %s', code,  command);
    }
    if (typeof cb === 'function') {
      cb(code === 0 ? null : code);
    }
  });
};