var mtuc = require('./');
var net = require('net');
var assert = require('assert');
var preview = require('preview')('test');

var closed;

net.createServer(function(ssock) {
  ssock.on('data', function(chunk) {
    chunk = chunk.toString();
    console.log(chunk);
    assert.equal(chunk, 'A');
    closed = true;
    ssock.end();
  });  
}).listen(8585, function() { 
  var sclt = net.connect({hostname: '127.0.0.1', port: 8585, noDelay: true}, function() {
    var mtucontoller = new mtuc({}, sclt);
    mtucontoller.send(new Buffer('A')); 
    sclt.on('close', function() {
      assert(closed);
      process.exit(0);
    });
  });
});

