'use strict';

const { EventEmitter } = require('node:events');

class MessageBus extends EventEmitter {
  publishInbound(message) {
    this.emit('inbound', message);
    return message;
  }
}

const bus = new MessageBus();

module.exports = { MessageBus, bus };
