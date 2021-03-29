import Emitter from 'component-emitter'
import SocketClient from './socket-client'

const createPayload = function (object) {
  return object ? JSON.parse(JSON.stringify(object)) : undefined
}

/**
 * A mocking class for the Socket IO Server side
 */
export default class SocketMock extends Emitter {
  /**
   * Creates a new SocketMock instance
  **/
  constructor () {
    super()
    this.joinedRooms = this.rooms = []
    this.socketClient = new SocketClient(this)
    this._emitFn = Emitter.prototype.emit
    this.generalCallbacks = {}
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
              this.generalCallbacks[eventKey](createPayload(payload), roomKey)
            }
          }
        }
      }
    }
  }

  /**
   * Emit an event to the server (used by client)
   * @param  {string} eventKey -- The event key
   * @param  {object} payload -- Additional payload
   * @param  {function} ack -- The ack argument is optional. When server call it payload reply will be delivered to client
  **/
  emitEvent (eventKey, args, ack) {
    this._emitFn(eventKey, ...args.map(createPayload), ack)
  }

  /**
   * Register on every event that the server sends
   * @param {string} eventKey
   * @param {Function} callback
  **/
  onEmit (eventKey, callback) {
    this.generalCallbacks[eventKey] = callback
  }

  /**
   * Emit an event to the client
   * @param  {string} eventKey -- The event key
   * @param  {object} payload -- Additional payload
  **/
  emit (eventKey, payload) {
    this.socketClient.fireEvent(eventKey, payload)
  }

  /**
   * Joining a room
   * @param  {string} roomKey The room we want to join
  **/
  join (roomKey) {
    this.joinedRooms.push(roomKey)
  }

  /**
   * Leaving a room
   * @param  {string} roomKey The room you want to leave
  **/
  leave (roomKey) {
    const index = this.joinedRooms.indexOf(roomKey)
    this.joinedRooms.splice(index, 1)
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
    this.emit('disconnecting', 'io server disconnect')
    this.emit('disconnect', 'io server disconnect')
    return this
  }
}
