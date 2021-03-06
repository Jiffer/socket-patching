var ecstatic = require('ecstatic')
var server = require('http').createServer(
  ecstatic({ root: __dirname, handleError: false })
)
var p2pserver = require('socket.io-p2p-server').Server
var io = require('socket.io')(server)

var socket_rooms = {}


server.listen(3030, function () {
  console.log('Listening on 3030')
})

 //io.use(p2pserver)

io.on('connection', function (socket) {
  socket.on('join-room', function(roomName){
    console.log("Currently in rooms:", socket.rooms)
    console.log("\treceived request to join room: ", roomName)
    socket.join(roomName)
    console.log("\t\tclients for room: ", {name: roomName})//.sockets.keys())
    p2pserver(socket, null, roomName) // 'gravy' // {name:roomName}
    socket_rooms[socket.id] = roomName
  })

  socket.on('peer-msg', function (data) {
    console.log('Message from peer: %s', data)
    socket.broadcast.to(socket_rooms[socket.id]).emit('peer-msg', data)
  })

  socket.on('peer-file', function (data) {
    console.log('File from peer: %s', data)
    socket.broadcast.to(socket_rooms[socket.id]).emit('peer-file', data)
  })

  socket.on('go-private', function (data) {
    console.log('go RTC!')
    socket.broadcast.to(socket_rooms[socket.id]).emit('go-private', data)
  })

  socket.on('boom', function(){
    console.log("bo0m" + socket.id);
    socket.broadcast.to(socket_rooms[socket.id]).emit('boom')
  })
})
