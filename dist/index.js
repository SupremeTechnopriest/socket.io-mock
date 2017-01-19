import createDebug from 'debug';

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var index = createCommonjsModule(function (module) {
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

  Emitter.prototype.on = Emitter.prototype.addEventListener = function (event, fn) {
    this._callbacks = this._callbacks || {};
    (this._callbacks['$' + event] = this._callbacks['$' + event] || []).push(fn);
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

  Emitter.prototype.once = function (event, fn) {
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

  Emitter.prototype.off = Emitter.prototype.removeListener = Emitter.prototype.removeAllListeners = Emitter.prototype.removeEventListener = function (event, fn) {
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
    return this;
  };

  /**
   * Emit `event` with the given args.
   *
   * @param {String} event
   * @param {Mixed} ...
   * @return {Emitter}
   */

  Emitter.prototype.emit = function (event) {
    this._callbacks = this._callbacks || {};
    var args = [].slice.call(arguments, 1),
        callbacks = this._callbacks['$' + event];

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

  Emitter.prototype.listeners = function (event) {
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

  Emitter.prototype.hasListeners = function (event) {
    return !!this.listeners(event).length;
  };
});

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();









var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

var debug$1 = createDebug('socket.io-mock:client');
var emitFn$1 = index.prototype.emit;

var SocketClient = function (_Emitter) {
	inherits(SocketClient, _Emitter);

	/**
  * A mocking class for the Socket IO Client side
  * @param {SocketMock} socketMock
  */
	function SocketClient(socketMock) {
		classCallCheck(this, SocketClient);

		var _this = possibleConstructorReturn(this, (SocketClient.__proto__ || Object.getPrototypeOf(SocketClient)).call(this));

		_this._socketMock = socketMock;
		return _this;
	}

	/**
  * Emit an event to the server client
  * @param  {string}   eventKey -- The event key that needs to be attached
  * @param  {object}   payload  -- The payload that needs to be attached to the emit
  * @param  {function} in_callback
  */


	createClass(SocketClient, [{
		key: 'emit',
		value: function emit(eventKey, payload, cb) {
			var callback = cb || function () {};
			debug$1('SocketClient', 'emit', eventKey);
			callback(this._socketMock.emitEvent(eventKey, payload));
		}

		/**
   * Fire an event to the server
   * @param  {string}   eventKey -- The event key that needs to be attached
   * @param  {object}   payload -- The payload that needs to be attached to the emit
   * @param  {Function} callback
   */

	}, {
		key: 'fireEvent',
		value: function fireEvent(eventKey, payload) {
			debug$1('Event %s on client side is dispatched with payload %s', eventKey, JSON.stringify(payload));
			emitFn$1.call(this, eventKey, payload);
		}
	}]);
	return SocketClient;
}(index);

var debug = createDebug('socket.io-mock:server');
var emitFn = index.prototype.emit;
var createPayload = function createPayload(object) {
	return JSON.parse(JSON.stringify(object));
};

/**
 * A mocking class for the Socket IO Server side
 */

var SocketMock = function (_Emitter) {
	inherits(SocketMock, _Emitter);

	/**
  * Creates a new SocketMock instance
  */
	function SocketMock() {
		classCallCheck(this, SocketMock);

		var _this = possibleConstructorReturn(this, (SocketMock.__proto__ || Object.getPrototypeOf(SocketMock)).call(this));

		_this.broadcast = {
			/**
   * Broadcast to room
   * @param  {string} roomKey the roomkey which need to be attached to
   * @return {object}
   */
			to: function to(roomKey) {
				return {
					/**
     * Emitting
     * @param  {string} eventKey
     * @param  {object} payload
     */
					emit: function emit(eventKey, payload) {
						if (_this.generalCallbacks[eventKey]) {
							_this.generalCallbacks[eventKey](createPayload(payload), roomKey);
						}
					}
				};
			}
		};

		_this.joinedRooms = _this.rooms = [];
		_this.socketClient = new SocketClient(_this);
		_this.generalCallbacks = {};
		_this.broadcast = {
			to: _this.broadcast.to.bind(_this)
		};
		return _this;
	}

	/**
 * Emit an event to the server (used by client)
 * @param  {string} eventKey -- The event key
 * @param  {object} payload -- Additional payload
 */


	createClass(SocketMock, [{
		key: 'emitEvent',
		value: function emitEvent(eventKey, payload) {
			debug('Event %s on server side is dispatched with payload %s', eventKey, JSON.stringify(payload));
			emitFn.call(this, eventKey, createPayload(payload));
		}

		/**
  * Register on every event that the server sends
  * @param {string} eventKey
  * @param {Function} callback
  */

	}, {
		key: 'onEmit',
		value: function onEmit(eventKey, callback) {
			this.generalCallbacks[eventKey] = callback;
		}

		/**
  * Emit an event to the client
  * @param  {string} eventKey -- The event key
  * @param  {object} payload -- Additional payload
  */

	}, {
		key: 'emit',
		value: function emit(eventKey, payload) {
			this.socketClient.fireEvent(eventKey, payload);
		}

		/**
   * Broadcast
   * @type {Object}
   */

	}, {
		key: 'join',


		/**
  * Joining a room
  * @param  {string} roomKey The room we want to join
  */
		value: function join(roomKey) {
			debug('Joining room %s', roomKey);
			this.joinedRooms.push(roomKey);
		}

		/**
  * Leaving a room
  * @param  {string} roomKey The room you want to leave
  */

	}, {
		key: 'leave',
		value: function leave(roomKey) {
			var index$$1 = this.joinedRooms.indexOf(roomKey);
			this.joinedRooms.splice(index$$1, 1);
		}

		/**
  * Monitor logging feature
  * @param  {string} value The value you want to monitor
  */

	}, {
		key: 'monitor',
		value: function monitor(value) {
			debug('Monitor: %s', value);
			return value;
		}
	}]);
	return SocketMock;
}(index);

export default SocketMock;
