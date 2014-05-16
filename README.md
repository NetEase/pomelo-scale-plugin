pomelo-scale-plugin
====================

pomelo-scale-plugin is a plugin for pomelo, it can be used in pomelo(>=0.6).

pomelo-scale-plugin provides auto scale up service for cluster. Developers can configure corresponding parameters for different types of servers, and the system would monitor the servers and scale up automatically with parameters.

##Installation

```
npm install pomelo-scale-plugin
```

##Usage

```
var scale = require('pomelo-scale-plugin');

app.configure('production|development', 'master', function() {
	app.use(scale, {
		scale: {
			cpu: {
				chat: 10,
				interval: 10 * 1000,
				increasement: 1
			},
			memory: {
				connector: 25,
				interval: 15 * 1000,
				increasement: 1
		  },
		  backup: 'config/development/backupServers.json'
		}
	});
});

```


```
//backupServers.json

{
	"connector":[
	{"id":"connector-server-1", "host":"127.0.0.1", "port":4050, "clientPort": 3050, "frontend": true},
	{"id":"connector-server-2", "host":"127.0.0.1", "port":4051, "clientPort": 3051, "frontend": true},
	{"id":"connector-server-3", "host":"127.0.0.1", "port":4052, "clientPort": 3052, "frontend": true}
	],
	"chat":[
	{"id":"chat-server-1", "host":"127.0.0.1", "port":6050}
	],
	"gate":[
	{"id": "gate-server-1", "host": "127.0.0.1", "clientPort": 3014, "frontend": true}
	]
}

```

##Configuration Explanation

The plugin now has two kinds of monitoring index, including cpu and memory. Developers can add types of servers that need to monitor, for example in above configuration chat: 10, this means if the average cpu of chat servers is over 10%, the system would automatically scale up, and the servers which will be added are according to the configuration backup: 'config/development/backupServers.json'. And the account of servers that will be added determines by the increasement field. The interval field means the period of checking of each index.