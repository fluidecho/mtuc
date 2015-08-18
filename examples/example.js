"use strict";
//
// MTUC, example
//
// Version: 0.0.1
// Author: Mark W. B. Ashcroft (mark [at] fluidecho [dot] com)
// License: MIT or Apache 2.0.
//
// Copyright (c) 2015 Mark W. B. Ashcroft.
// Copyright (c) 2015 FluidEcho.
//


var mtuc = require('..');     // npm install mtuc
var net  = require('net');    // TCP


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

