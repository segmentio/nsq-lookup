
/**
 * Module dependencies.
 */

var lookup = require('./');

lookup(['http://0.0.0.0:4161', 'http://0.0.0.0:6000'], function(err, nodes){
  if (err) throw err;
  console.log(nodes);
});