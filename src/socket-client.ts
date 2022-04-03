/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

import Emitter from 'component-emitter';
import type { SocketServerMock } from '.';

/**
 * Mocked Socket.IO client.
 */
export class SocketClientMock extends Emitter {
  /**
   * Are we currently connected?
   * @default false
   */
  connected: boolean;

  /**
   * Are we currently disconnected?
   * @default true
   */
  disconnected: boolean;

  /**
   * Mocked Socket.IO server.
   */
  serverMock: SocketServerMock;

  _emitFn: (event: string, ...args: any[]) => Emitter;

  /**
   * Mocked Socket.IO client.
   *
   * @param {SocketServerMock} serverMock
   */
  constructor(serverMock: SocketServerMock) {
    super();
    this.serverMock = serverMock;
    this._emitFn = Emitter.prototype.emit;

    this.connected = false;
    this.disconnected = true;
  }

  /**
   * Emit an event to the server.
   *
   * If the last argument is a function, then it will be called
   * as an 'ack' when the response is received. The parameter(s) of the
   * ack will be whatever data is returned from the event
   *
   * @param {string}   event - The event that we're emitting
   * @param {any[]}   args  - Optional arguments to send with the event
   * @returns {Emitter<string>}
   */
  emit = (event: string, ...args: any[]): Emitter<string> => {
    let ack;
    if (typeof args[args.length - 1] === 'function') {
      ack = args.pop();
    }

    return this.serverMock.emitEvent(event, args, ack);
  };

  /**
   * Fire an event to the server.
   *
   * If the last argument is a function, then it will be called
   * as an 'ack' when the response is received. The parameter(s) of the
   * ack will be whatever data is returned from the event
   *
   * @param {string} event - The event that we're emitting
   * @param {any[]} args - Optional arguments to send with the event
   */
  fireEvent = (event: string, ...args: any[]) => {
    return this._emitFn(event, ...args);
  };

  /**
   * Close the socket.
   */
  close = () => {
    this.disconnected = true;
    this.connected = false;
    this.emit('disconnect', 'io client disconnect');
    return this;
  };

  /**
   * Disconnect the socket manually.
   */
  disconnect = () => {
    return this.close();
  };
}

export default SocketClientMock;
