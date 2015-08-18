
/**
 * Module dependencies.
 */

var debug = require('debug')('nsq-lookup');
var request = require('superagent');
var Batch = require('batch');

/**
 * Retry support.
 */

require('superagent-retry')(request);


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

function lookup(addrs, opts, fn) {
  var batch = new Batch;
  batch.throws(false);
  batch.concurrency(addrs.length);

  if ('function' == typeof opts) {
    fn = opts;
    opts = {};
  }

  var timeout = opts.timeout || 20000;
  addrs.forEach(function(addr){
    debug('lookup %s', addr);
    batch.push(function(done){
      request
      .get(addr + '/nodes')
      .timeout(timeout)
      .retry(2)
      .end(function(err, res){
        if (err) return done(err);
        if (res.error) return done(res.error);
        done(null, res.body.data.producers);
      })
    });
  });

  batch.end(function(errors, results){
    errors = filter(errors);
    results = dedupe(filter(results));
    debug('errors=%j results=%j', errors, results);
    fn(errors, results)
  });
}

/**
 * Drops null and uddefined.
 */

function filter(arr) {
  return arr.filter(function(v){
    return v != null;
  });
}

/**
 * Dedupe `results`.
 *
 * @param {Array} results
 * @return {Array}
 * @api private
 */

function dedupe(results) {
  results = results || [];

  var ret = [];
  var set = {};

  results.forEach(function(nodes){
    nodes.forEach(function(node){
      var addr = node.broadcast_address + ':' + node.tcp_port;
      if (set[addr]) return debug('already registered');
      set[addr] = true;
      ret.push(node);
    });
  });

  return ret;
}
