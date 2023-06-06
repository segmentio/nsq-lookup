
/**
 * Module dependencies.
 */

var lookup = require('./');

var addrs = [
	'http://0.0.0.0:4161',
	'http://0.0.0.0:4162',
	'http://0.0.0.0:4161',
];

var opts = {
	timeout: 10000
};

lookup(addrs, opts, function(errors, nodes){
  if (errors) {
  	console.error(errors)
  } else {
  	console.log(nodes);
  }
});
