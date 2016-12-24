# socket.io-mock
[![Build Status](https://travis-ci.org/SupremeTechnopriest/socket.io-mock.svg?branch=master)](https://travis-ci.org/SupremeTechnopriest/socket.io-mock)
[![npm version](https://badge.fury.io/js/socket.io-mock.svg)](http://badge.fury.io/js/socket.io-mock)


A mock to test the socket.io library implementation.  

This is an enhanced copy of [socket-io-mock](https://github.com/glemmaPaul/socket-io-mock/pulls).

> I made this project becuase `socket-io-mock` does not appear to be actively maintained.  This project takes advantage of `eventemitter` covering more of the socket.io-client library. If you see any bugs or lack of support for socket.io features, please drop an  [issue](https://github.com/supremetechnopriest/socket.io-mock/issues).

# Installation
```bash
npm install socket.io-mock
```

# Usage
Simply create new socket mock with:
```js
import MockedSocket from 'socket.io-mock';
let socket = new MockedSocket();
```
And use the socket as if it was a normal Socket.io socket.

For example:

```js
import SocketMock from 'socket.io-mock';
import { should } from 'chai';

describe('Fast and isolated socket tests', function(){
    it('Sockets should be able to talk to each other without a server', function(done) {
        let socket = new SocketMock();

        socket.on('message', function (message) {
            message.should.be.equal('Hello World!');
        });
        socket.socketClient.emit('message', 'Hello World!');
    });
});
```
