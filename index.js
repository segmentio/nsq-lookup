
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

exports = module.exports = lookup;

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
  var retries = opts.retries || 2;
  var path = '/nodes';

  //
  // This should be opt in. The cases where you are looking up nsqd instances
  // as an nsq-writer needs the ability to get all of the nodes if the topic
  // has not been created yet by a publish. We shouldn't limit the set of nodes
  // in that case. For readers this makes sense.
  //
  if (opts.topic) {
    path = '/lookup?topic=' + opts.topic;
  }

  addrs.forEach(function(addr){
    debug('lookup %s for topic %s', addr, opts.topic);
    batch.push(function(done){
      request
      .get(addr + path)
      .timeout(timeout)
      .retry(retries)
      .end(function(err, res){
        if (err) return done(err);
        if (res.error) return done(res.error);
        var data = res.body && res.body.data || {};
        var producers = data.producers || [];
        done(null, producers);
      })
    });
  });

  batch.end(function(errors, results){
    errors = filter(errors);
    results = filter(results);

    results = dedupe(results);

    debug('errors=%j results=%j', errors, results);
    fn(errors.length ? errors : null, results);
  });
}

/**
 * Drops null and uddefined.
 */

function filter(arr) {
  arry = arr || [];
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
