var should = require('chai').should()
  , SocketMock = require('../')
  , eventPayload = require('./fixtures/socketmock').payload
  , roomKey = 'room'
  , socket


describe('Utils: Socket', function(){
  beforeEach(function(done) {
    socket = new SocketMock()
    done()
  })
  it('should fire event on the server side when on() is assigned', function(done){
    socket.on("test", function(payload) {
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

    socket.socketClient.emit("test", eventPayload)
  })

  it('should fire event on the client side when on() is assigned', function(done) {
    socket.socketClient.on("test", function(payload) {
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

    socket.emit("test", eventPayload)
  })

  it('Should add a room to `rooms` when join() is called', function(done) {

    socket.join(roomKey)
    socket.rooms[0].should.be.equal(roomKey)

    done()

  })

  it('Should remove a room in `rooms` when leave() is called', function(done) {

    var anotherRoom = 'anotherroom';
    socket.join(roomKey)
    socket.join(anotherRoom)
    socket.rooms[0].should.be.equal(roomKey)
    socket.rooms[1].should.be.equal(anotherRoom)

    socket.leave(anotherRoom)
    socket.rooms.should.eql([roomKey]);

    done()
  })

  it('Should fire `onEmit()` callback when a event is fired in the room', function(done) {

    socket.join(roomKey)

    var eventPayload = {
      "test": "123"
    }

    socket.onEmit('test', function(payload, roomEvent) {
      roomEvent.should.be.equal(roomKey)

      payload.should.have.property("test")
      payload.test.should.be.equal("123")

      done()
    })

    socket.broadcast.to(roomKey).emit('test', eventPayload)
  })

  it('should expose socket.rooms which is the same as socket.joinedRooms', function() {
    socket.rooms.should.equal(socket.joinedRooms);
  });

})