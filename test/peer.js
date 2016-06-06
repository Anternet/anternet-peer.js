const assert = require('assert');
const Peer = require('../peer');
const { describe, it } = global;

describe('Peer', () => {
  describe('.constructor', () => {
    it('should create from IPv4', () => {
      const address = '83.54.192.20';
      const port = 15921;

      const peer = new Peer(port, address);
      assert(peer instanceof Peer);

      assert.equal(peer.address, address);
      assert.equal(peer.port, port);
      assert.equal(peer.family, 'IPv4');
    });

    it('should create from IPv6', () => {
      const address = '2001:0db8:85a3:0000:0000:8a2e:0370:7334';
      const port = 3940;
      const nAddress = '2001:db8:85a3::8a2e:370:7334';

      const peer = new Peer(port, address);
      assert(peer instanceof Peer);

      assert.equal(peer.address, nAddress);
      assert.equal(peer.port, port);
      assert.equal(peer.family, 'IPv6');
    });
  });

  describe('.fromBuffer()', () => {
    it('should create from IPv4 buffer', () => {
      const ipArr = [83, 54, 192, 20];
      const port = 15921;

      const buffer = Buffer.from(ipArr.concat([0, 0]));
      buffer.writeUInt16BE(port, 4);

      const peer = Peer.fromBuffer(buffer);

      assert(peer instanceof Peer);
      assert.equal(peer.port, port);
      assert.equal(peer.address, ipArr.join('.'));
      assert.equal(peer.family, 'IPv4');

      assert(buffer.equals(peer.toBuffer()));
    });

    it('should create from IPv6 buffer', () => {
      const ipArr = '2001:0db8:85a3:0000:0000:8a2e:0370:7334'.split(':');
      const shortAddress = '2001:db8:85a3::8a2e:370:7334';
      const port = 28650;
      const buffer = Buffer.from(ipArr.join('') + port.toString(16), 'hex');

      const peer = Peer.fromBuffer(buffer);

      assert(peer instanceof Peer);
      assert.equal(peer.port, port);
      assert.equal(peer.address, shortAddress);
      assert.equal(peer.family, 'IPv6');

      assert(buffer.equals(peer.toBuffer()));
    });
  });


  describe('.normalizeAddress()', () => {
    it('should work with IPv4', () => {
      const address = '83.54.192.20';

      assert.equal(Peer.normalizeAddress(address), address);
    });

    it('should work with IPv6', () => {
      const address = '2001:db8:85a3::8a2e:370:7334';
      const fullAddress = '2001:0db8:85a3:0000:0000:8a2e:0370:7334';

      assert.equal(Peer.normalizeAddress(address), address);
      assert.equal(Peer.normalizeAddress(fullAddress), address);
    });

    it('should work with special addresses', () => {
      const addresses = [
        ['127.0.0.1', '127.0.0.1'],
        ['001.0.0.1', '1.0.0.1'],
        ['::0:1', '::1'],
        ['0001:0000:0000:0000:0000:0000:0000:0001', '1::1'],
      ];

      for (const i of addresses) {
        assert.equal(Peer.normalizeAddress(i[0]), i[1], `${i[0]} => ${i[1]}`);
      }
    });
  });

  describe('instance', () => {
    describe('.key', () => {
      it('should work with IPv4', () => {
        const peer = new Peer(121, '83.54.192.20');

        assert.equal(peer.key, `${peer.address}:${peer.port}`);
      });

      it('should work with IPv6', () => {
        const peer = new Peer(885, '2001:db8:85a3::8a2e:370:7334');

        assert.equal(peer.key, `${peer.address}:${peer.port}`);
      });
    });

    describe('.toBuffer()', () => {
      it('should create from IPv4', () => {
        const peer = new Peer(15921, '83.54.192.20');

        const buffer = peer.toBuffer();
        assert(buffer instanceof Buffer);
        assert.equal(buffer.length, 6);

        assert.deepEqual(buffer.slice(0, buffer.length - 2),
            peer.address.split('.').map(str => parseInt(str, 10)));
        assert.equal(buffer.readUInt16BE(buffer.length - 2), peer.port);
      });

      it('should create from IPv6', () => {
        const address = '2001:0db8:85a3:0000:0000:8a2e:0370:7334';
        const peer = new Peer(15921, address);

        const buffer = peer.toBuffer();
        assert(buffer instanceof Buffer);
        assert.equal(buffer.length, 18);

        assert.equal(buffer.slice(0, buffer.length - 2).toString('hex'),
            address.split(':').join(''));
        assert.equal(buffer.readUInt16BE(buffer.length - 2), peer.port);
      });
    });

    describe('.equals()', () => {
      it('should equal with same peer', () => {
        const peer = new Peer(15921, '83.54.192.20');

        assert.equal(peer.equals(peer), true);
      });

      it('should equal with equal peer', () => {
        const peer = new Peer(15921, '83.54.192.20');
        const peer2 = new Peer(15921, '83.54.192.20');

        assert.equal(peer.equals(peer2), true);
        assert.equal(peer2.equals(peer), true);
      });

      it('should not equal on different address', () => {
        const peer = new Peer(15921, '83.54.192.20');
        const peer2 = new Peer(15921, '83.54.192.21');

        assert.equal(peer.equals(peer2), false);
        assert.equal(peer2.equals(peer), false);
      });

      it('should not equal on different port', () => {
        const peer = new Peer(15921, '83.54.192.20');
        const peer2 = new Peer(15920, '83.54.192.20');

        assert.equal(peer.equals(peer2), false);
        assert.equal(peer2.equals(peer), false);
      });

      it('should not equal on different peer', () => {
        const peer = new Peer(15921, '83.54.192.20');
        const peer2 = new Peer(15920, '83.54.192.21');

        assert.equal(peer.equals(peer2), false);
        assert.equal(peer2.equals(peer), false);
      });

      it('should equal with same IPv6 peer', () => {
        const peer = new Peer(15921, '2001:0db8:85a3:0000:0000:8a2e:0370:7334');

        assert.equal(peer.equals(peer), true);
      });

      it('should equal with equal IPv6 peer', () => {
        const peer = new Peer(15920, '2001:0db8:85a3:0000:0000:8a2e:0370:7334');
        const peer2 = new Peer(15920, '2001:db8:85a3::8a2e:370:7334');

        assert.equal(peer.equals(peer), true);
        assert.equal(peer2.equals(peer), true);
      });

      it('should not equal on different IPv6 peer', () => {
        const peer = new Peer(15921, '2001:0db8:85a3:0000:0000:8a2e:0370:7334');
        const peer2 = new Peer(15920, '2002:db8:85a3::8a2e:370:7334');

        assert.equal(peer.equals(peer2), false);
        assert.equal(peer2.equals(peer), false);
      });
    });
  });
});
