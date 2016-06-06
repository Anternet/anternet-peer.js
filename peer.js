const EventEmitter = require('events');
const ip = require('ip');
const Anternet = require('anternet');

const IPV4_LENGTH = 4;
const IPV6_LENGTH = 16;
const PORT_LENGTH = 2;

const FAMILY_IPV4 = 'IPv4';
const FAMILY_IPV6 = 'IPv6';

// allowed values: 0..127
const PARSER_REG_PEER = 101;

class Peer extends EventEmitter {

  constructor(port, address) {
    super();

    this.address = this.constructor.normalizeAddress(address);
    this.port = parseInt(port, 10);
  }

  static fromBuffer(buffer) {
    const addressLength = buffer.length - PORT_LENGTH;

    const address = ip.toString(buffer.slice(0, addressLength));
    const port = buffer.readUInt16BE(addressLength);

    return new this(port, address);
  }

  static normalizeAddress(address) {
    return address.replace(/(^|:)0+/g, '$1').replace(/::+/g, '::');
  }

  static extend(anternet) {
    if (!(anternet instanceof Anternet)) {
      throw new Error('Invalid instance; Anternet instance expected');
    }

    anternet.register(PARSER_REG_PEER, this, peer => peer.toBuffer(), buf => this.fromBuffer(buf));
  }

  get key() {
    return `${this.address}:${this.port}`;
  }

  get family() {
    return ip.isV4Format(this.address) ? FAMILY_IPV4 : FAMILY_IPV6;
  }

  toBuffer() {
    const ipLength = ip.isV4Format(this.address) ? IPV4_LENGTH : IPV6_LENGTH;
    const buffer = Buffer.alloc(ipLength + PORT_LENGTH);

    ip.toBuffer(this.address, buffer, 0);
    buffer.writeUInt16BE(this.port, ipLength);

    return buffer;
  }

  equals(other) {
    return other instanceof this.constructor
        && this.port === other.port && this.address === other.address;
  }
}

module.exports = Peer;
