import { vi, test, expect, beforeEach } from 'vitest';
import { SocketServerMock } from '../src';

let socket: SocketServerMock;

beforeEach(() => {
  socket = new SocketServerMock();
});

test('Should fire event on the server side when on() is assigned', async () => {
  const eventPayload = {
    never: 'Hello World',
    gonna: true,
    give: 123,
    you: ['up'],
  };

  const data = await new Promise((resolve) => {
    socket.on('test', (payload: typeof eventPayload) => {
      resolve(payload);
    });

    socket.clientMock.emit('test', eventPayload);
  });

  expect(data).toHaveProperty('never', eventPayload.never);
  expect(data).toHaveProperty('gonna', eventPayload.gonna);
  expect(data).toHaveProperty('give', eventPayload.give);
  expect(data).toHaveProperty('you', eventPayload.you);
});

test('Should fire event on the server side when on() is assigned and multiple parameters are passed', async () => {
  const { arg1, arg2, arg3 } = await new Promise((resolve) => {
    socket.on('test', (args1: number, args2: number, args3: number) => {
      resolve({ arg1: args1, arg2: args2, arg3: args3 });
    });

    socket.clientMock.emit('test', 1, 2, 3);
  });

  expect(arg1).toBe(1);
  expect(arg2).toBe(2);
  expect(arg3).toBe(3);
});

test('Should call ack on the server side when on() is assigned ack callback must be called', () => {
  const ackPayload = { foo: 'bar' };

  socket.on('test', (payload: unknown, ack: (payload: typeof ackPayload) => void) => {
    ack(ackPayload);
  });

  const func = vi.fn((data: typeof ackPayload) => {
    expect(data).toHaveProperty('foo', ackPayload.foo);
  });

  socket.clientMock.emit('test', {}, func);

  expect(func).toBeCalled();
  expect(func).lastCalledWith(ackPayload);
});

test('Should call ack on the server side when on() is assigned and no payload was passed', () => {
  socket.on('test', (ack: () => void) => {
    ack();
  });

  const func = vi.fn(() => {
    expect(true).toBeTruthy();
  });

  socket.clientMock.emit('test', func);

  expect(func).toBeCalled();
  expect(func).lastCalledWith();
});

test('Should fire event on the client side when on() is assigned', async () => {
  const eventPayload = {
    never: 'Hello World',
    gonna: true,
    give: 123,
    you: ['up'],
  };

  const data = await new Promise((resolve) => {
    socket.clientMock.on('test', (payload: typeof eventPayload) => {
      resolve(payload);
    });

    socket.emit('test', eventPayload);
  });

  expect(data).toHaveProperty('never', eventPayload.never);
  expect(data).toHaveProperty('gonna', eventPayload.gonna);
  expect(data).toHaveProperty('give', eventPayload.give);
  expect(data).toHaveProperty('you', eventPayload.you);
});

test('Should add a room to `rooms` when join() is called', () => {
  socket.join('room1');

  expect(socket.rooms[0]).toBe('room1');
});

test('Should remove a room in `rooms` when leave() is called', () => {
  socket.join('room1');
  socket.join('room2');
  socket.join('room3');

  expect(socket.rooms[0]).toBe('room1');
  expect(socket.rooms[1]).toBe('room2');
  expect(socket.rooms[2]).toBe('room3');
  expect(socket.rooms.length).toBe(3);

  socket.leave('room2');

  expect(socket.rooms[0]).toBe('room1');
  expect(socket.rooms[1]).toBe('room3');
  expect(socket.rooms[2]).toBeUndefined();
  expect(socket.rooms.length).toBe(2);
});

test('Should fire `onEmit()` callback when a event is fired in the room', async () => {
  socket.join('room1');

  const eventPayload = {
    test: '123',
  };

  const { payload, room } = await new Promise((resolve) => {
    socket.onEmit('test', (payloadArg: typeof eventPayload, roomArg: string) => {
      resolve({ payload: payloadArg, room: roomArg });
    });

    socket.broadcast.to('room1').emit('test', eventPayload);
  });

  expect(payload).toHaveProperty('test', eventPayload.test);
  expect(room).toBe('room1');
});

test('Should fire `onEmit()` callback when a event is fired in the room alternative method', async () => {
  socket.join('room1');

  const eventPayload = {
    test: '123',
  };

  const { payload, room } = await new Promise((resolve) => {
    socket.onEmit('test', (payloadArg: typeof eventPayload, roomArg: string) => {
      resolve({ payload: payloadArg, room: roomArg });
    });

    socket.to('room1').emit('test', eventPayload);
  });

  expect(payload).toHaveProperty('test', eventPayload.test);
  expect(room).toBe('room1');
});

test('Should expose socket.rooms which is the same as socket.joinedRooms', () => {
  expect(socket.rooms.length).toBe(0);

  socket.join('room1');

  expect(socket.rooms.length).toBe(1);
  expect(socket.rooms[0]).toBe('room1');
});

test('Should turn on monitor mode', () => {
  const monitor = socket.monitor('test');

  expect(monitor).toBe('test');
});

test('Should pass a simple test', async () => {
  const socketMock = new SocketServerMock();

  const data = await new Promise((resolve) => {
    socketMock.on('event', (message: string) => {
      resolve(message);
    });

    socketMock.clientMock.emit('event', 'Hello');
  });

  expect(data).toBe('Hello');
});

test('Should send event with no data', async () => {
  const socketMock = new SocketServerMock();

  const data = await new Promise((resolve) => {
    socketMock.on('event', (message: string) => {
      resolve(message);
    });

    socketMock.clientMock.emit('event');
  });

  expect(data).toBeUndefined();
});
