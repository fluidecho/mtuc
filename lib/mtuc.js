"use strict";
//
// MTUC, Maximum transmission unit controller.
//
// Version: 0.0.1
// Author: Mark W. B. Ashcroft (mark [at] fluidecho [dot] com)
// License: MIT or Apache 2.0.
//
// Copyright (c) 2015 Mark W. B. Ashcroft.
// Copyright (c) 2015 FluidEcho.
//


//var preview = require('preview')('mtuc');


var mtuc = function (opts, sock) {
  //preview('MTUC opts', opts);
  
  this.options = {
    mtu: 1500,          // Maximum transmission unit size in bytes.
    delay: 100,         // ms to delay before flushing if queue is smaller then mtu.
    noDelay: false,     // if true, disable this the mtu-controller.
  };
  
  this.socket = sock;
  this.queue = new Buffer(0);
  this.timmer = undefined;
  this.overflowing = false;   // returns true if socket overflowing (needs pausing).
  
  for ( var o in opts ) {
    if ( this.options[o] != undefined ) {
      this.options[o] = opts[o];
    }
  }
  
};


module.exports = mtuc;    // user call: var mtucontoller = new mtuc({mtu: 1500}, socket);



mtuc.prototype.flush = function () {
  
  //preview('flush queue, write to wire');
  
  var self = this;
    
  if ( this.timmer != undefined ) {
    //preview('clearTimeout');
    clearTimeout(this.timmer);
    this.timmer = undefined;
  }

  //preview('this.queue.length: ' + this.queue.length + ', this.options.mtu: ' + this.options.mtu);
  
  var tailing = 0;
  for ( var i = 0; i < this.queue.length; i += this.options.mtu ) {
    
    tailing = this.options.mtu - ((i + this.options.mtu) - this.queue.length);
    //preview('trailing bytes: ' + tailing);
    
    var buf = this.queue.slice(i, this.options.mtu + i);

    this.overflowing = this.socket.write(buf);
    
  }

  if ( tailing > 0 && tailing != this.options.mtu ) {
    var queuetrimed = this.queue.slice(i);
    this.queue = null;
    this.queue = queuetrimed;
    
    if ( this.timmer === undefined ) {
      this.timmer = setTimeout(function() {
        //preview('flush timmer, timedout');
        this.timmer = undefined;    // undefined now.
        return self.flush();
      }, this.options.delay);
    }   
    
  } else {
    //preview('DONE/FIN');
    this.queue = null;
    this.queue = new Buffer(0);   
  }
  
  return this.overflowing;    // returns true if socket overflowing.
  
};



mtuc.prototype.send = function (buffer) {

  //preview('send ' + buffer.length, buffer);
  
  // if disabled, write to socket now return.
  if ( this.options.noDelay ) {
    return this.socket.write(buffer);
  }

  var self = this;  
  
  this.queue = Buffer.concat([this.queue, buffer], this.queue.length + buffer.length); 
  
  //preview('this.queue ' + this.queue.length, this.queue);
  
  if ( this.queue.length >= this.options.mtu ) {
    
    return self.flush();
  
  } else {
  
    // wait for more or delay timedout.
    //console.log('wait for more or delay timedout');
    
    if ( this.timmer === undefined ) {
      this.timmer = setTimeout(function() {
        //preview('timmer, timedout');
        this.timmer = undefined;    // undefined now.
        return self.flush();
      }, this.options.delay);
    }
    
    return true;    // must return true for next.
  
  }

};

