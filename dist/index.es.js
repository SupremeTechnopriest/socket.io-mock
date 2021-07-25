const anyMap = new WeakMap();
const eventsMap = new WeakMap();
const producersMap = new WeakMap();
const anyProducer = Symbol('anyProducer');
const resolvedPromise = Promise.resolve();

const listenerAdded = Symbol('listenerAdded');
const listenerRemoved = Symbol('listenerRemoved');

let isGlobalDebugEnabled = false;

function assertEventName(eventName) {
	if (typeof eventName !== 'string' && typeof eventName !== 'symbol') {
		throw new TypeError('eventName must be a string or a symbol');
	}
}

function assertListener(listener) {
	if (typeof listener !== 'function') {
		throw new TypeError('listener must be a function');
	}
}

function getListeners(instance, eventName) {
	const events = eventsMap.get(instance);
	if (!events.has(eventName)) {
		events.set(eventName, new Set());
	}

	return events.get(eventName);
}

function getEventProducers(instance, eventName) {
	const key = typeof eventName === 'string' || typeof eventName === 'symbol' ? eventName : anyProducer;
	const producers = producersMap.get(instance);
	if (!producers.has(key)) {
		producers.set(key, new Set());
	}

	return producers.get(key);
}

function enqueueProducers(instance, eventName, eventData) {
	const producers = producersMap.get(instance);
	if (producers.has(eventName)) {
		for (const producer of producers.get(eventName)) {
			producer.enqueue(eventData);
		}
	}

	if (producers.has(anyProducer)) {
		const item = Promise.all([eventName, eventData]);
		for (const producer of producers.get(anyProducer)) {
			producer.enqueue(item);
		}
	}
}

function iterator(instance, eventNames) {
	eventNames = Array.isArray(eventNames) ? eventNames : [eventNames];

	let isFinished = false;
	let flush = () => {};
	let queue = [];

	const producer = {
		enqueue(item) {
			queue.push(item);
			flush();
		},
		finish() {
			isFinished = true;
			flush();
		}
	};

	for (const eventName of eventNames) {
		getEventProducers(instance, eventName).add(producer);
	}

	return {
		async next() {
			if (!queue) {
				return {done: true};
			}

			if (queue.length === 0) {
				if (isFinished) {
					queue = undefined;
					return this.next();
				}

				await new Promise(resolve => {
					flush = resolve;
				});

				return this.next();
			}

			return {
				done: false,
				value: await queue.shift()
			};
		},

		async return(value) {
			queue = undefined;

			for (const eventName of eventNames) {
				getEventProducers(instance, eventName).delete(producer);
			}

			flush();

			return arguments.length > 0 ?
				{done: true, value: await value} :
				{done: true};
		},

		[Symbol.asyncIterator]() {
			return this;
		}
	};
}

function defaultMethodNamesOrAssert(methodNames) {
	if (methodNames === undefined) {
		return allEmitteryMethods;
	}

	if (!Array.isArray(methodNames)) {
		throw new TypeError('`methodNames` must be an array of strings');
	}

	for (const methodName of methodNames) {
		if (!allEmitteryMethods.includes(methodName)) {
			if (typeof methodName !== 'string') {
				throw new TypeError('`methodNames` element must be a string');
			}

			throw new Error(`${methodName} is not Emittery method`);
		}
	}

	return methodNames;
}

const isListenerSymbol = symbol => symbol === listenerAdded || symbol === listenerRemoved;

class Emittery {
	static mixin(emitteryPropertyName, methodNames) {
		methodNames = defaultMethodNamesOrAssert(methodNames);
		return target => {
			if (typeof target !== 'function') {
				throw new TypeError('`target` must be function');
			}

			for (const methodName of methodNames) {
				if (target.prototype[methodName] !== undefined) {
					throw new Error(`The property \`${methodName}\` already exists on \`target\``);
				}
			}

			function getEmitteryProperty() {
				Object.defineProperty(this, emitteryPropertyName, {
					enumerable: false,
					value: new Emittery()
				});
				return this[emitteryPropertyName];
			}

			Object.defineProperty(target.prototype, emitteryPropertyName, {
				enumerable: false,
				get: getEmitteryProperty
			});

			const emitteryMethodCaller = methodName => function (...args) {
				return this[emitteryPropertyName][methodName](...args);
			};

			for (const methodName of methodNames) {
				Object.defineProperty(target.prototype, methodName, {
					enumerable: false,
					value: emitteryMethodCaller(methodName)
				});
			}

			return target;
		};
	}

	static get isDebugEnabled() {
		if (typeof process !== 'object') {
			return isGlobalDebugEnabled;
		}

		const {env} = process || {env: {}};
		return env.DEBUG === 'emittery' || env.DEBUG === '*' || isGlobalDebugEnabled;
	}

	static set isDebugEnabled(newValue) {
		isGlobalDebugEnabled = newValue;
	}

	constructor(options = {}) {
		anyMap.set(this, new Set());
		eventsMap.set(this, new Map());
		producersMap.set(this, new Map());
		this.debug = options.debug || {};

		if (this.debug.enabled === undefined) {
			this.debug.enabled = false;
		}

		if (!this.debug.logger) {
			this.debug.logger = (type, debugName, eventName, eventData) => {
				eventData = JSON.stringify(eventData);

				if (typeof eventName === 'symbol') {
					eventName = eventName.toString();
				}

				const currentTime = new Date();
				const logTime = `${currentTime.getHours()}:${currentTime.getMinutes()}:${currentTime.getSeconds()}.${currentTime.getMilliseconds()}`;
				console.log(`[${logTime}][emittery:${type}][${debugName}] Event Name: ${eventName}\n\tdata: ${eventData}`);
			};
		}
	}

	logIfDebugEnabled(type, eventName, eventData) {
		if (Emittery.isDebugEnabled || this.debug.enabled) {
			this.debug.logger(type, this.debug.name, eventName, eventData);
		}
	}

	on(eventNames, listener) {
		assertListener(listener);

		eventNames = Array.isArray(eventNames) ? eventNames : [eventNames];
		for (const eventName of eventNames) {
			assertEventName(eventName);
			getListeners(this, eventName).add(listener);

			this.logIfDebugEnabled('subscribe', eventName, undefined);

			if (!isListenerSymbol(eventName)) {
				this.emit(listenerAdded, {eventName, listener});
			}
		}

		return this.off.bind(this, eventNames, listener);
	}

	off(eventNames, listener) {
		assertListener(listener);

		eventNames = Array.isArray(eventNames) ? eventNames : [eventNames];
		for (const eventName of eventNames) {
			assertEventName(eventName);
			getListeners(this, eventName).delete(listener);

			this.logIfDebugEnabled('unsubscribe', eventName, undefined);

			if (!isListenerSymbol(eventName)) {
				this.emit(listenerRemoved, {eventName, listener});
			}
		}
	}

	once(eventNames) {
		return new Promise(resolve => {
			const off = this.on(eventNames, data => {
				off();
				resolve(data);
			});
		});
	}

	events(eventNames) {
		eventNames = Array.isArray(eventNames) ? eventNames : [eventNames];
		for (const eventName of eventNames) {
			assertEventName(eventName);
		}

		return iterator(this, eventNames);
	}

	async emit(eventName, eventData) {
		assertEventName(eventName);

		this.logIfDebugEnabled('emit', eventName, eventData);

		enqueueProducers(this, eventName, eventData);

		const listeners = getListeners(this, eventName);
		const anyListeners = anyMap.get(this);
		const staticListeners = [...listeners];
		const staticAnyListeners = isListenerSymbol(eventName) ? [] : [...anyListeners];

		await resolvedPromise;
		await Promise.all([
			...staticListeners.map(async listener => {
				if (listeners.has(listener)) {
					return listener(eventData);
				}
			}),
			...staticAnyListeners.map(async listener => {
				if (anyListeners.has(listener)) {
					return listener(eventName, eventData);
				}
			})
		]);
	}

	async emitSerial(eventName, eventData) {
		assertEventName(eventName);

		this.logIfDebugEnabled('emitSerial', eventName, eventData);

		const listeners = getListeners(this, eventName);
		const anyListeners = anyMap.get(this);
		const staticListeners = [...listeners];
		const staticAnyListeners = [...anyListeners];

		await resolvedPromise;
		/* eslint-disable no-await-in-loop */
		for (const listener of staticListeners) {
			if (listeners.has(listener)) {
				await listener(eventData);
			}
		}

		for (const listener of staticAnyListeners) {
			if (anyListeners.has(listener)) {
				await listener(eventName, eventData);
			}
		}
		/* eslint-enable no-await-in-loop */
	}

	onAny(listener) {
		assertListener(listener);

		this.logIfDebugEnabled('subscribeAny', undefined, undefined);

		anyMap.get(this).add(listener);
		this.emit(listenerAdded, {listener});
		return this.offAny.bind(this, listener);
	}

	anyEvent() {
		return iterator(this);
	}

	offAny(listener) {
		assertListener(listener);

		this.logIfDebugEnabled('unsubscribeAny', undefined, undefined);

		this.emit(listenerRemoved, {listener});
		anyMap.get(this).delete(listener);
	}

	clearListeners(eventNames) {
		eventNames = Array.isArray(eventNames) ? eventNames : [eventNames];

		for (const eventName of eventNames) {
			this.logIfDebugEnabled('clear', eventName, undefined);

			if (typeof eventName === 'string' || typeof eventName === 'symbol') {
				getListeners(this, eventName).clear();

				const producers = getEventProducers(this, eventName);

				for (const producer of producers) {
					producer.finish();
				}

				producers.clear();
			} else {
				anyMap.get(this).clear();

				for (const listeners of eventsMap.get(this).values()) {
					listeners.clear();
				}

				for (const producers of producersMap.get(this).values()) {
					for (const producer of producers) {
						producer.finish();
					}

					producers.clear();
				}
			}
		}
	}

	listenerCount(eventNames) {
		eventNames = Array.isArray(eventNames) ? eventNames : [eventNames];
		let count = 0;

		for (const eventName of eventNames) {
			if (typeof eventName === 'string') {
				count += anyMap.get(this).size + getListeners(this, eventName).size +
					getEventProducers(this, eventName).size + getEventProducers(this).size;
				continue;
			}

			if (typeof eventName !== 'undefined') {
				assertEventName(eventName);
			}

			count += anyMap.get(this).size;

			for (const value of eventsMap.get(this).values()) {
				count += value.size;
			}

			for (const value of producersMap.get(this).values()) {
				count += value.size;
			}
		}

		return count;
	}

	bindMethods(target, methodNames) {
		if (typeof target !== 'object' || target === null) {
			throw new TypeError('`target` must be an object');
		}

		methodNames = defaultMethodNamesOrAssert(methodNames);

		for (const methodName of methodNames) {
			if (target[methodName] !== undefined) {
				throw new Error(`The property \`${methodName}\` already exists on \`target\``);
			}

			Object.defineProperty(target, methodName, {
				enumerable: false,
				value: this[methodName].bind(this)
			});
		}
	}
}

const allEmitteryMethods = Object.getOwnPropertyNames(Emittery.prototype).filter(v => v !== 'constructor');

Object.defineProperty(Emittery, 'listenerAdded', {
	value: listenerAdded,
	writable: false,
	enumerable: true,
	configurable: false
});
Object.defineProperty(Emittery, 'listenerRemoved', {
	value: listenerRemoved,
	writable: false,
	enumerable: true,
	configurable: false
});

class SocketClient extends Emittery {
  /**
   * A mocking class for the Socket IO Client side
   * @param {SocketMock} socketMock
   */
  constructor (socketMock) {
    super();
    this._socketMock = socketMock;
    this._emitFn = Emittery.prototype.emit;
    this.connected = true;
    this.disconnected = false;
  }

  /**
   * Emit an event to the server client
   * @param  {string}   eventKey -- The event key that needs to be attached
   * @param  {object}   payload  -- The payload that needs to be attached to the emit
   * @param  {function} ack -- The ack argument is optional and will be called with the server answer.
   */
  emit (eventKey, ...args) {
    this._socketMock.emitEvent(eventKey, args);
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
class SocketMock extends Emittery {
  /**
   * Creates a new SocketMock instance
  **/
  constructor () {
    super();
    this.joinedRooms = this.rooms = [];
    this.socketClient = new SocketClient(this);
    this._emitFn = Emittery.prototype.emit;
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
  **/
  emitEvent (eventKey, args) {
    this._emitFn(eventKey, args);
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

export default SocketMock;
