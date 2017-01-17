import Emitter from 'component-emitter';
import createDebug from 'debug';

import SocketClient from './socket-client';

const debug = createDebug('socket.io-mock:server');
const emitFn = Emitter.prototype.emit;
const createPayload = function (object) {
	return JSON.parse(JSON.stringify(object));
};

/**
 * A mocking class for the Socket IO Server side
 */
export default class SocketMock extends Emitter {

	/**
	 * Creates a new SocketMock instance
	 */
	constructor() {
		super();
		this.joinedRooms = this.rooms = [];
		this.socketClient = new SocketClient(this);
		this.generalCallbacks = {};
		this.broadcast = {
			to: this.broadcast.to.bind(this)
		};
	}

	/**
	* Emit an event to the server (used by client)
	* @param  {string} eventKey -- The event key
	* @param  {object} payload -- Additional payload
	*/
	emitEvent(eventKey, payload) {
		debug('Event %s on server side is dispatched with payload %s', eventKey, JSON.stringify(payload));
		emitFn.call(this, eventKey, createPayload(payload));
	}

	/**
	* Register on every event that the server sends
	* @param {string} eventKey
	* @param {Function} callback
	*/
	onEmit(eventKey, callback) {
		this.generalCallbacks[eventKey] = callback;
	}

	/**
	* Emit an event to the client
	* @param  {string} eventKey -- The event key
	* @param  {object} payload -- Additional payload
	*/
	emit(eventKey, payload) {
		this.socketClient.fireEvent(eventKey, payload);
	}

	/**
	 * Broadcast
	 * @type {Object}
	 */
	broadcast = {
		/**
		* Broadcast to room
		* @param  {string} roomKey the roomkey which need to be attached to
		* @return {object}
		*/
		to: roomKey => {
			return {
				/**
				* Emitting
				* @param  {string} eventKey
				* @param  {object} payload
				*/
				emit: (eventKey, payload) => {
					if (this.generalCallbacks[eventKey]) {
						this.generalCallbacks[eventKey](createPayload(payload), roomKey);
					}
				}
			};
		}
	}

	/**
	* Joining a room
	* @param  {string} roomKey The room we want to join
	*/
	join(roomKey) {
		debug('Joining room %s', roomKey);
		this.joinedRooms.push(roomKey);
	}

	/**
	* Leaving a room
	* @param  {string} roomKey The room you want to leave
	*/
	leave(roomKey) {
		const index = this.joinedRooms.indexOf(roomKey);
		this.joinedRooms.splice(index, 1);
	}

	/**
	* Monitor logging feature
	* @param  {string} value The value you want to monitor
	*/
	monitor(value) {
		debug('Monitor: %s', value);
		return value;
	}
}
