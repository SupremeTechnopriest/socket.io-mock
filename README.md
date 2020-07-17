# socket.io-mock
[![npm version](https://badge.fury.io/js/socket.io-mock.svg)](http://badge.fury.io/js/socket.io-mock)
[![npm license](https://img.shields.io/npm/l/socket.io-mock.svg?maxAge=2592000)](https://www.npmjs.com/package/socket.io-mock)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)

[![Build Status](https://travis-ci.org/SupremeTechnopriest/socket.io-mock.svg?branch=master)](https://travis-ci.org/SupremeTechnopriest/socket.io-mock)
[![Code Climate](https://codeclimate.com/repos/587e92067a5baf5dec0032e2/badges/3ce040863b099e5ae525/gpa.svg)](https://codeclimate.com/repos/587e92067a5baf5dec0032e2/feed)
[![Test Coverage](https://codeclimate.com/repos/587e92067a5baf5dec0032e2/badges/3ce040863b099e5ae525/coverage.svg)](https://codeclimate.com/repos/587e92067a5baf5dec0032e2/coverage)
[![Issue Count](https://codeclimate.com/repos/587e92067a5baf5dec0032e2/badges/3ce040863b099e5ae525/issue_count.svg)](https://codeclimate.com/repos/587e92067a5baf5dec0032e2/feed)
[![npm](https://img.shields.io/npm/dm/socket.io-mock.svg?maxAge=2592000)](https://www.npmjs.com/package/socket.io-mock)
[![npm](https://img.shields.io/npm/dt/socket.io-mock.svg?maxAge=2592000)](https://www.npmjs.com/package/socket.io-mock)

A mock to test the socket.io library implementation.  

🚀 Now written in ES6!  Bundled with [`rollup`](https://github.com/rollup/rollup).

> NEW! Added support for disconnect() and close()

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
import { expect } from 'chai';

describe('Fast and isolated socket tests', function(){
    it('Sockets should be able to talk to each other without a server', function(done) {
        let socket = new SocketMock();

        socket.on('message', function (message) {
            expect(message).to.equal('Hello World!');
        });
        socket.socketClient.emit('message', 'Hello World!');
    });
});
```
