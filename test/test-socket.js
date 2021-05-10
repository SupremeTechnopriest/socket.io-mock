/* eslint-env mocha */
import SocketMock from '../src'
import { eventPayload } from './utils'

const roomKey = 'room'
let socket

describe('Utils: Socket', () => {
  beforeEach(done => {
    socket = new SocketMock()
    done()
  })

  it('should fire event on the server side when on() is assigned', done => {
    socket.on('test', payload => {
      payload.should.have.property('never')
      payload.should.have.property('gonna')
      payload.should.have.property('give')
      payload.should.have.property('you')

      payload.never.should.be.equal(eventPayload.never)
      payload.gonna.should.be.equal(eventPayload.gonna)
      payload.give.should.be.equal(eventPayload.give)
      payload.you[0].should.be.equal(eventPayload.you[0])

      done()
    })

    socket.socketClient.emit('test', eventPayload)
  })

  it('should fire event on the server side when on() is assigned and multiple parameters are passed', done => {
    socket.on('test', (arg1, arg2, arg3) => {
      arg1.should.be.equal(1)
      arg2.should.be.equal(2)
      arg3.should.be.equal(3)

      done()
    })

    socket.socketClient.emit('test', 1, 2, 3)
  })

  it('should call ack on the server side when on() is assigned ack callback must be called', done => {
    const ackPayload = { foo: 'bar' }
    socket.on('test', (payload, ack) => {
      ack(ackPayload)
    })

    socket.socketClient.emit('test', {}, (payload) => {
      payload.should.have.property('foo')
      payload.foo.should.be.equal(ackPayload.foo)
      done()
    })
  })

  it('should call ack on the server side when on() is assigned and no payload was passed', done => {
    socket.on('test', ack => {
      ack()
    })

    socket.socketClient.emit('test', () => {
      done()
    })
  })

  it('should fire event on the client side when on() is assigned', done => {
    socket.socketClient.on('test', payload => {
      payload.should.have.property('never')
      payload.should.have.property('gonna')
      payload.should.have.property('give')
      payload.should.have.property('you')

      payload.never.should.be.equal(eventPayload.never)
      payload.gonna.should.be.equal(eventPayload.gonna)
      payload.give.should.be.equal(eventPayload.give)
      payload.you[0].should.be.equal(eventPayload.you[0])

      done()
    })

    socket.emit('test', eventPayload)
  })

  it('Should add a room to `rooms` when join() is called', done => {
    socket.join(roomKey)
    socket.rooms[0].should.be.equal(roomKey)

    done()
  })

  it('Should remove a room in `rooms` when leave() is called', done => {
    const anotherRoom = 'anotherroom'
    socket.join(roomKey)
    socket.join(anotherRoom)
    socket.rooms[0].should.be.equal(roomKey)
    socket.rooms[1].should.be.equal(anotherRoom)

    socket.leave(anotherRoom)
    socket.rooms.should.eql([roomKey])

    done()
  })

  it('Should fire `onEmit()` callback when a event is fired in the room', done => {
    socket.join(roomKey)

    const eventPayload = {
      test: '123'
    }

    socket.onEmit('test', (payload, roomEvent) => {
      roomEvent.should.be.equal(roomKey)

      payload.should.have.property('test')
      payload.test.should.be.equal('123')

      done()
    })

    socket.broadcast.to(roomKey).emit('test', eventPayload)
  })

  it('should expose socket.rooms which is the same as socket.joinedRooms', () => {
    socket.rooms.should.equal(socket.joinedRooms)
  })

  it('should turn on monitor mode', () => {
    const monitor = socket.monitor('test')
    monitor.should.be.equal('test')
  })

  it('should pass a simple test', (done) => {
    const socketMock = new SocketMock()
    socketMock.on('event', (message) => {
      message.should.be.equal('Hello')
      done()
    })

    socketMock.socketClient.emit('event', 'Hello')
  })

  it('should send event with no data', (done) => {
    const socketMock = new SocketMock()
    socketMock.on('event', (message) => {
      done()
    })

    socketMock.socketClient.emit('event')
  })
})
