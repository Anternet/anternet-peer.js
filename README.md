# anternet-peer.js

[![build](https://img.shields.io/travis/Anternet/anternet-peer.js.svg?branch=master)](https://travis-ci.org/Anternet/anternet-peer.js)
[![npm](https://img.shields.io/npm/v/anternet-peer.svg)](https://npmjs.org/package/anternet-peer)
[![Join the chat at https://gitter.im/Anternet/anternet.js](https://badges.gitter.im/Anternet/anternet.js.svg)](https://gitter.im/Anternet/anternet.js?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![npm](https://img.shields.io/npm/l/anternet-peer.svg)](LICENSE)


[Anternet](https://www.npmjs.com/package/anternet) peer extension.

## Example

```js
const Anternet = require('anternet');
const Peer = require('anternet-peer');

const anternet = new Anternet();
Peer.extend(anternet);

const address = '127.0.0.1';
const port = 12345;
const peer = new Peer(port, address);

// send peer on request
anternet.request(msgType, [peer], 123123, '127.0.0.1');

// send peer on response
anternet.response(rid, [peer], 123123, '127.0.0.1');
```

## License

[MIT License](LICENSE).
Copyright &copy; 2016 [Moshe Simantov](https://github.com/moshest)



