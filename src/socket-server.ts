/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

import Emitter from 'component-emitter';
import { SocketClientMock } from './socket-client';

const createArgs = (args: any): any => {
  return args ? JSON.parse(JSON.stringify(args)) : undefined;
};

/**
 * Mocked Socket.IO server.
 */
export class SocketServerMock extends Emitter {
  /**
   * Mocked Socket.IO client.
   */
  clientMock: SocketClientMock;

  /**
   * List of rooms.
   */
  rooms: string[];

  _emitFn: (event: string, ...args: any[]) => Emitter;

  generalCallbacks: {
    [key: string]: Function;
  };

  /**
   * Broadcast to a room.
   *
   * @return {Function} Broadcast options.
   */
  broadcast: {
    /**
     * Broadcast to a room.
     *
     * @param {string} room The room to broadcast to.
     * @return {Function} Functions to perform on the room.
     **/
    to: (room: string) => {
      /**
       * Emit to the room.
       *
       * @param {string} event
       * @param {any[]} args
       **/
      emit: (event: string, ...args: any[]) => void;
    };
  };

  /**
   * Creates a new SocketMock instance.
   **/
  constructor() {
    super();

    this.clientMock = new SocketClientMock(this);
    this.rooms = [];

    this._emitFn = Emitter.prototype.emit;
    this.generalCallbacks = {};
    this.broadcast = {
      to: (room: string) => {
        return {
          emit: (event: string, ...args: any[]) => {
            if (this.generalCallbacks[event]) {
              this.generalCallbacks[event](...args.map(createArgs), room);
            }
          },
        };
      },
    };

    this.clientMock.connected = true;
    this.clientMock.disconnected = false;
    this.emit('connect');
  }

  /**
   * Emit an event to the server (used by client).
   *
   * @param {string} event - The event.
   * @param {any[]} args - Additional args.
   * @param {Emitter} ack - The ack argument is optional. When the server calls it, args reply will be delivered to client
   **/
  emitEvent = (event: string, args: any[], ack?: Function): Emitter => {
    return this._emitFn(event, ...args.map(createArgs), ack);
  };

  /**
   * Register on every event that the server sends.
   * @param {string} event
   * @param {Function} callback
   **/
  onEmit = (event: string, callback: Function) => {
    this.generalCallbacks[event] = callback;
  };

  /**
   * Emit an event to the client.
   *
   * @param {string} event - The event.
   * @param {any[]} args - Additional args.
   **/
  emit = (event: string, ...args: any[]) => {
    return this.clientMock.fireEvent(event, ...args);
  };

  /**
   * Join a room.
   *
   * @param {string} room The room we want to join.
   **/
  join = (room: string) => {
    this.rooms.push(room);
  };

  /**
   * Leave a room.
   *
   * @param {string} room The room you want to leave.
   **/
  leave = (room: string) => {
    const index = this.rooms.indexOf(room);
    this.rooms.splice(index, 1);
  };

  /**
   * Monitor logging feature.
   *
   * @param {string} value The value you want to monitor.
   **/
  monitor = (value: string): string => {
    return value;
  };

  /**
   * Close the socket server.
   *
   * @returns {SocketServerMock} The mocked Socket.IO server.
   */
  disconnect = (): SocketServerMock => {
    this.emit('disconnecting', 'Socket.IO mock server disconnect');
    this.emit('disconnect', 'Socket.IO mock server disconnect');
    return this;
  };

  /**
   * Broadcast to a room.
   *
   * @param {string} room The room to broadcast to.
   * @return {Record<string, Function>} Functions to perform on the room.
   **/
  to = (room: string): Record<string, Function> => {
    return {
      /**
       * Emit an event to the room.
       *
       * @param {string} event
       * @param {any[]} args
       **/
      emit: (event: string, ...args: any[]) => {
        if (this.generalCallbacks[event]) {
          this.generalCallbacks[event](...args.map(createArgs), room);
        }
      },
    };
  };
}

export default SocketServerMock;
