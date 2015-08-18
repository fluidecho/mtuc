# Maximum transmission unit controller. [![Build Status](https://api.travis-ci.org/fluidecho/mtuc.png)](https://travis-ci.org/fluidecho/mtuc)

Maximum transmission unit controller makes sending data over TCP more efficient, faster! The 
[Maximum transmission unit](https://en.wikipedia.org/wiki/Maximum_transmission_unit) (MTU) sets the 
maximum size of a packet of bytes to be sent over the network wire. When you have many messages to 
send that are each less in size that the MTU setting, it is much more efficient to buffer these 
messages up to best fit the MTU and then send, this is what this module does.

TCP has a inbuilt feature called 'noDelay', also called the [Nagle algorithm](https://en.wikipedia.org/wiki/Nagle%27s_algorithm). 
This algorithm when enabled: ['noDelay = false'](https://nodejs.org/api/net.html#net_socket_setnodelay_nodelay), 
does a similar job as this module. However this module provides even faster results and fine tuning 
controls. It is possible to use both the Nagle algorithm and this module together, or separately.

MTUC works well with data framing modules 'messages', such as: [SMP](https://github.com/smprotocol/smp-node), [AMP](https://github.com/tj/node-amp), [MQTT](https://github.com/mqttjs/mqtt-packet).


## Installation

```
npm install mtuc
```


## Examples

_See examples folder. To print use preview, eg: node examples/mtuc.js --preview_

```js
var mtuc = require('mtuc');     // npm install mtuc
var net  = require('net');      // TCP


// TCP server.
var server = net.createServer(function(sock){

  sock.on('data', function(chunk){
    console.log('chunk', chunk);
  });

}).listen(8888);


// TCP client.
var clientsocket = net.connect(8888);

// as example mtu size set to 10, production should be ~ 1500 or 9000.
var mtucontoller = new mtuc({mtu: 10}, clientsocket);   // {options}, socket (can be either server or client sockets).

var data = 'abcdefghijklmnopqrstuvwxyz';    // 26 bytes.

mtucontoller.send(new Buffer(data));    // send( <Buffer> ), returns true if socket overflowing.
```


## Benchmarking

_See bm folder to run benchmarking tests._

### Results

Using a WebSocket connection _[naked-websocket](https://github.com/fluidecho/naked-websocket)_ and 
sending 200 byte [SMP messages](https://github.com/smprotocol/smp-node), I get over 300,000 messages per second.

```
---------------------------------------------
| RESULTS ~
---------------------------------------------
|     median: 322,581 ops/s
|       mean: 275,587 ops/s
|      total: 2,750,084 ops in 9.979s
|    through: 55.39 MB/s
---------------------------------------------
```


## Tips (Linux)

### To view your MTU setting 

```
netstat -i
```
Or
```
ifconfig
```

### To change a MTU setting of say the eth0 network to 9000 bytes (temp)

```
sudo ifconfig eth0 mtu 9000
```


## Options

```
 mtu: 1500,        // Maximum transmission unit size in bytes.
 delay: 100,       // ms to delay before flushing if buffer batch is smaller than mtu.
 noDelay: false,   // if true, disable this the mtu-controller and write to the socket immediately.
```


## License

Choose either: [MIT](http://opensource.org/licenses/MIT) or [Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0).
