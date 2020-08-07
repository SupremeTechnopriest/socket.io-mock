'use strict';

function createCommonjsModule(fn, basedir, module) {
	return module = {
	  path: basedir,
	  exports: {},
	  require: function (path, base) {
      return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
    }
	}, fn(module, module.exports), module.exports;
}

function commonjsRequire () {
	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
}

var componentEmitter = createCommonjsModule(function (module) {
/**
 * Expose `Emitter`.
 */

{
  module.exports = Emitter;
}

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
}
/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  function on() {
    this.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks['$' + event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks['$' + event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }

  // Remove event specific arrays for event types that no
  // one is subscribed for to avoid memory leak.
  if (callbacks.length === 0) {
    delete this._callbacks['$' + event];
  }

  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};

  var args = new Array(arguments.length - 1)
    , callbacks = this._callbacks['$' + event];

  for (var i = 1; i < arguments.length; i++) {
    args[i - 1] = arguments[i];
  }

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks['$' + event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};
});

class SocketClient extends componentEmitter {
  /**
   * A mocking class for the Socket IO Client side
   * @param {SocketMock} socketMock
   */
  constructor (socketMock) {
    super();
    this._socketMock = socketMock;
    this._emitFn = componentEmitter.prototype.emit;
    this.connected = true;
    this.disconnected = false;
  }

  /**
   * Emit an event to the server client
   * @param  {string}   eventKey -- The event key that needs to be attached
   * @param  {object}   payload  -- The payload that needs to be attached to the emit
   * @param  {function} ack -- The ack argument is optional and will be called with the server answer.
   */
  emit (eventKey, payload, ack) {
    if (typeof payload === 'function') {
      payload = null;
      ack = payload;
    }
    this._socketMock.emitEvent(eventKey, payload, ack);
  }

  /**
   * Fire an event to the server
   * @param  {string}   eventKey -- The event key that needs to be attached
   * @param  {object}   payload -- The payload that needs to be attached to the emit
   * @param  {Function} callback
   */
  fireEvent (eventKey, payload) {
    this._emitFn(eventKey, payload);
  }

  /**
   * Close the socket
   */
  close () {
    this.disconnected = true;
    this.connected = false;
    this.emit('disconnect', 'io client disconnect');
    return this
  }

  /**
   * Disconnet the socket alias for close
   */
  disconnect () {
    return this.close()
  }
}

const createPayload = function (object) {
  return object ? JSON.parse(JSON.stringify(object)) : undefined
};

/**
 * A mocking class for the Socket IO Server side
 */
class SocketMock extends componentEmitter {
  /**
   * Creates a new SocketMock instance
  **/
  constructor () {
    super();
    this.joinedRooms = this.rooms = [];
    this.socketClient = new SocketClient(this);
    this._emitFn = componentEmitter.prototype.emit;
    this.generalCallbacks = {};
    this.broadcast = {
      /**
       * Broadcast to room
       * @param  {string} roomKey the roomkey which need to be attached to
       * @return {object}
      **/
      to: roomKey => {
        return {
          /**
           * Emitting
           * @param  {string} eventKey
           * @param  {object} payload
          **/
          emit: (eventKey, payload) => {
            if (this.generalCallbacks[eventKey]) {
              this.generalCallbacks[eventKey](createPayload(payload), roomKey);
            }
          }
        }
      }
    };
  }

  /**
   * Emit an event to the server (used by client)
   * @param  {string} eventKey -- The event key
   * @param  {object} payload -- Additional payload
   * @param  {function} ack -- The ack argument is optional. When server call it payload reply will be delivered to client
  **/
  emitEvent (eventKey, payload, ack) {
    this._emitFn(eventKey, createPayload(payload), ack);
  }

  /**
   * Register on every event that the server sends
   * @param {string} eventKey
   * @param {Function} callback
  **/
  onEmit (eventKey, callback) {
    this.generalCallbacks[eventKey] = callback;
  }

  /**
   * Emit an event to the client
   * @param  {string} eventKey -- The event key
   * @param  {object} payload -- Additional payload
  **/
  emit (eventKey, payload) {
    this.socketClient.fireEvent(eventKey, payload);
  }

  /**
   * Joining a room
   * @param  {string} roomKey The room we want to join
  **/
  join (roomKey) {
    this.joinedRooms.push(roomKey);
  }

  /**
   * Leaving a room
   * @param  {string} roomKey The room you want to leave
  **/
  leave (roomKey) {
    const index = this.joinedRooms.indexOf(roomKey);
    this.joinedRooms.splice(index, 1);
  }

  /**
   * Monitor logging feature
   * @param  {string} value The value you want to monitor
  **/
  monitor (value) {
    return value
  }

  /**
   * Closing the socket server
   * @param  {Function} cb
   */
  disconnect () {
    this.emit('disconnecting', 'io server disconnect');
    this.emit('disconnect', 'io server disconnect');
    return this
  }
}

module.exports = SocketMock;
