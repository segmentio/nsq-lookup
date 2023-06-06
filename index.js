
/**
 * Module dependencies.
 */

const debug = require('debug')('nsq-lookup');
const request = require('superagent');
const Batch = require('batch');

/**
 * Lookup using nsqlookupd `addrs`.
 *
 * @param {Array} addrs
 * @param {Function|{}} opts
 * @param {(Function|undefined)} fn
 * @access public
 */

function lookup(addrs, opts, fn) {
  var batch = new Batch;
  batch.throws(false);
  batch.concurrency(addrs.length);

  if (typeof opts === 'function') {
    fn = opts;
    opts = {};
  }

  var timeout = opts.timeout || 20000;
  var retries = opts.retries || 2;

  if (!opts.topic) {
    return fn(new Error('invalid or missing topic'), null);
  }

  addrs.forEach(function(addr) {
    debug('lookup %s for topic %s', addr, opts.topic);
    batch.push(function(done) {
      request
        .get(addr + '/lookup?topic=' + opts.topic)
        .timeout(timeout)
        .retry(retries, (err, res) => {
          if (res?.status === 500) {
            return false;
          }
        })
        .end(function(err, res) {
          if (err) return done(err);
          if (res.error) return done(res.error);
          var data = res.body && res.body.data || {};
          var producers = data.producers || [];
          done(null, producers);
        })
    });
  });

  batch.end(function(errors, results) {
    errors = errors?.filter(Boolean) ?? [];
    results = results?.filter(Boolean) ?? [];

    results = dedupe(results);

    debug('errors=%j results=%j', errors, results);
    fn(errors.length ? errors : null, results);
  });
}

/**
 * Dedupe `results`.
 *
 * @param {Array} results
 * @return {Array}
 * @access private
 */

function dedupe(results) {
  results = results || [];

  var ret = [];
  var set = {};

  results.forEach(function(nodes) {
    nodes.forEach(function(node) {
      var addr = node.broadcast_address + ':' + node.tcp_port;
      if (set[addr]) return debug('already registered');
      set[addr] = true;
      ret.push(node);
    });
  });

  return ret;
}

/**
 * Export `lookup()`.
 */

module.exports = lookup;
