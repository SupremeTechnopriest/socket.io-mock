var debug = require('debug')('socket.io-mock');
var EventEmitter = require('events').EventEmitter;

var createPayload = function(object) {
  return JSON.parse(JSON.stringify(object));
};

/**
 * A mocking class for the Socket IO Client side
 * @param {SocketMock} socketMock
 */
var SocketClient = function(socketMock) {
  this._socketMock = socketMock;
};
SocketClient.prototype = Object.create(EventEmitter.prototype);

/**
 * Emit an event to the server client
 * @param  {string}   eventKey -- The event key that needs to be attached
 * @param  {object}   payload  -- The payload that needs to be attached to the emit
 * @param  {function} in_callback
 */
SocketClient.prototype.emit = function(eventKey, payload, in_callback) {
  var callback = in_callback || function() {};
  debug('SocketClient', 'emit', eventKey);
  callback(this._socketMock.emitEvent(eventKey, payload));
};

/**
 * Fire an event to the server
 * @param  {string}   eventKey -- The event key that needs to be attached
 * @param  {object}   payload -- The payload that needs to be attached to the emit
 * @param  {Function} callback
 */
SocketClient.prototype.fireEvent = function(eventKey, payload) {
  debug('Event %s on client side is dispatched with payload %s', eventKey, JSON.stringify(payload));
  EventEmitter.prototype.emit.call(this, eventKey, payload);
};

/**
 * A mocking class for the Socket IO Server side
 */
var SocketMock = function() {
  this.joinedRooms = this.rooms = [];
  this.socketClient = new SocketClient(this);
  this.generalCallbacks = {};

  this.broadcast = {
    to: this.broadcast.to.bind(this)
  };
};
SocketMock.prototype = Object.create(EventEmitter.prototype);

/**
 * Emit an event to the server (used by client)
 * @param  {string} eventKey -- The event key
 * @param  {object} payload -- Additional payload
 */
SocketMock.prototype.emitEvent = function(eventKey, payload) {
  debug('Event %s on server side is dispatched with payload %s', eventKey, JSON.stringify(payload));

  console.log('socketmock', 'emitEvent', eventKey);
  EventEmitter.prototype.emit.call(this, eventKey, createPayload(payload));
};

/**
 * Register on every event that the server sends
 * @param {string} eventKey
 * @param {Function} callback
 */
SocketMock.prototype.onEmit = function(eventKey, callback) {
  this.generalCallbacks[eventKey] = callback;
};

/**
 * Emit an event to the client
 * @param  {string} eventKey -- The event key
 * @param  {object} payload -- Additional payload
 */
SocketMock.prototype.emit = function(eventKey, payload) {
  this.socketClient.fireEvent(eventKey, payload);
};

SocketMock.prototype.broadcast = {};

/**
 * Broadcast to room
 * @param  {string} roomKey the roomkey which need to be attached to
 * @return {object}
 */
SocketMock.prototype.broadcast.to = function(roomKey) {
  var that = this;
  return {
          /**
           * Emitting
           * @param  {string} eventKey
           * @param  {object} payload
           */
    emit: function(eventKey, payload) {
      if (that.generalCallbacks[eventKey]) {
        that.generalCallbacks[eventKey](createPayload(payload), roomKey);
      }
    }
  };
};

/**
 * Joining a room
 * @param  {string} roomKey The room we want to join
 */
SocketMock.prototype.join = function(roomKey) {
  this.joinedRooms.push(roomKey);
};

/**
 * Leaving a room
 * @param  {string} roomKey The room you want to leave
 */
SocketMock.prototype.leave = function(roomKey) {
  var index = this.joinedRooms.indexOf(roomKey);
  this.joinedRooms.splice(index, 1);
};

  /**
   * Monitor logging feature
   * @param  {string} value The value you want to monitor
   */
SocketMock.prototype.monitor = function(value) {
  debug('Monitor: %s', value);
};

module.exports = SocketMock;
