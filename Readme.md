
# nsq-lookup

  Lookup nsqd nodes via N nsqlookupd addresses.

## Installation

```
$ npm install nsq-lookup
```

## Example

```js
var lookup = require('nsq-lookup');

lookup(['http://0.0.0.0:4161', 'http://0.0.0.0:6000'], function(err, nodes){
  if (err) throw err;
  console.log(nodes);
});
```

# License

  MIT