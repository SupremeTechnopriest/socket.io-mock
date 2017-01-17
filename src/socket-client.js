import createDebug from 'debug';
import Emitter from 'component-emitter';

const debug = createDebug('socket.io-mock:client');
const emitFn = Emitter.prototype.emit;

export default class SocketClient extends Emitter {
	/**
	 * A mocking class for the Socket IO Client side
	 * @param {SocketMock} socketMock
	 */
	constructor(socketMock) {
		super();
		this._socketMock = socketMock;
	}

	/**
	 * Emit an event to the server client
	 * @param  {string}   eventKey -- The event key that needs to be attached
	 * @param  {object}   payload  -- The payload that needs to be attached to the emit
	 * @param  {function} in_callback
	 */
	emit(eventKey, payload, cb) {
		const callback = cb || function () {};
		debug('SocketClient', 'emit', eventKey);
		callback(this._socketMock.emitEvent(eventKey, payload));
	}

	/**
	 * Fire an event to the server
	 * @param  {string}   eventKey -- The event key that needs to be attached
	 * @param  {object}   payload -- The payload that needs to be attached to the emit
	 * @param  {Function} callback
	 */
	fireEvent(eventKey, payload) {
		debug('Event %s on client side is dispatched with payload %s', eventKey, JSON.stringify(payload));
		emitFn.call(this, eventKey, payload);
	}
}
