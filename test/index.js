var lookup = require('..');
var assert = require('assert');

describe('nsq-lookup', function() {
  it('should expose `filterTopic`', function() {
    assert('function' === typeof lookup.topicFilter);
  });

  it('should filter based on topic', function() {
    var nodes = [
      {
        broadcast_address: '10.0.0.1',
        topics: [
          'foobar123',
          'foobar234'
        ]
      },
      {
        broadcast_address: '10.0.0.2',
        topics: [
          'foobar123'
        ]
      },
      {
        broadcast_address: '10.0.0.3',
        topics: [
          'events'
        ]
      }
    ];

    var filtered = lookup.topicFilter('foobar123', nodes);
    assert.equal(filtered.length, 2);
    assert.equal(filtered[0].broadcast_address, '10.0.0.1');
    assert.equal(filtered[1].broadcast_address, '10.0.0.2');
  });
});
