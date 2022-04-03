# Socket.IO-Mock (TypeScript)

A mock to test the Socket.IO library implementation.

- Written with Typescript.
- Bundled with [vite](https://github.com/vitejs/vite).
- Tested with [vitest](https://github.com/vitest-dev/vitest).

> NEW! Added support for disconnect() and close()

# Installation

```bash
yarn add socket.io-mock-ts
```

# Usage

Create a new socket mock with:

```ts
import { SocketServerMock } from 'socket.io-mock';

const socket = new SocketServerMock();

const client = socket.clientMock;
```

And use the socket as if it was a normal Socket.IO socket.

For example:

```ts
import { SocketServerMock } from 'socket.io-mock';
import { expect, test } from 'vitest';

test('Sockets should be able to talk to each other without a server', () => {
  const socket = new SocketServerMock();

  socket.on('message', (message: string) => {
    expect(message).toBe('Hello World!');
  });

  socket.clientMock.emit('message', 'Hello World!');
});
```

Or with using promises in unit tests, for example:

```ts
import { SocketServerMock } from 'socket.io-mock';
import { expect, test } from 'vitest';

test('Sockets should be able to talk to each other without a server', () => {
  const socket = new SocketServerMock();

  const data = await new Promise((resolve) => {
    socket.on('message', (message: string) => {
      resolve(message);
    });

    socket.clientMock.emit('message', 'Hello World!');
  });

  expect(data).toBe('Hello World!');
});
```
