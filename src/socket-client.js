import Emitter from 'component-emitter'

export default class SocketClient extends Emitter {
  /**
   * A mocking class for the Socket IO Client side
   * @param {SocketMock} socketMock
   */
  constructor (socketMock) {
    super()
    this._socketMock = socketMock
    this._emitFn = Emitter.prototype.emit
    this.connected = true
    this.disconnected = false
  }

  /**
   * Emit an event to the server client
   * @param  {string}   eventKey -- The event key that needs to be attached
   * @param  {object}   payload  -- The payload that needs to be attached to the emit
   * @param  {function} ack -- The ack argument is optional and will be called with the server answer.
   */
  emit (eventKey, payload, ack) {
    if (typeof payload === 'function') {
      payload = null
      ack = payload
    }
    this._socketMock.emitEvent(eventKey, payload, ack)
  }

  /**
   * Fire an event to the server
   * @param  {string}   eventKey -- The event key that needs to be attached
   * @param  {object}   payload -- The payload that needs to be attached to the emit
   * @param  {Function} callback
   */
  fireEvent (eventKey, payload) {
    this._emitFn(eventKey, payload)
  }

  /**
   * Close the socket
   */
  close () {
    this.disconnected = true
    this.connected = false
    this.emit('disconnect', 'io client disconnect')
    return this
  }

  /**
   * Disconnet the socket alias for close
   */
  disconnect () {
    return this.close()
  }
}
