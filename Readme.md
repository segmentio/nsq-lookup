
# nsq-lookup

  Lookup nsqd nodes via N nsqlookupd addresses.

## Installation

```
$ npm install nsq-lookup
```

## Example

```js
var lookup = require('nsq-lookup');

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
```

# License

  MIT