
/**
 * Module dependencies.
 */

var request = require('superagent');
var Batch = require('batch');

/**
 * Expose `lookup()`.
 */

module.exports = lookup;

/**
 * Lookup using nsqlookupd `addrs`.
 *
 * @param {Array} addrs
 * @param {Function} fn
 * @api public
 */

function lookup(addrs, fn) {
  var batch = new Batch;

  addrs.forEach(function(addr){
    batch.push(function(done){
      request
      .get(addr + '/nodes')
      .end(function(err, res){
        if (err) return done(err);
        if (res.error) return done(res.error);
        done(null, res.body.data.producers);
      })
    });
  });

  batch.end(function(err, results){
    if (err) return fn(err);
    fn(null, dedupe(results));
  });
}

function dedupe(results) {
  var ret = [];
  var set = {};

  results.forEach(function(nodes){
    nodes.forEach(function(node){
      var addr = node.broadcast_address + ':' + node.tcp_port;
      if (set[addr]) return;

      set[addr] = true;
      ret.push(node);
    });
  });

  return ret;
}