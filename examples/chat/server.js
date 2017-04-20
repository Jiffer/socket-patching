var ecstatic = require('ecstatic')
var server = require('http').createServer(
  ecstatic({ root: __dirname, handleError: false })
)
var p2pserver = require('socket.io-p2p-server').Server
var io = require('socket.io')(server)
var url = require('url')
var fs = require('fs')

var socket_rooms = {}


server.listen(3030, function () {
  console.log('Listening on 3030')
})

// use a url
function requestHandler(req, res) {

  var parsedUrl = url.parse(req.url);
  console.log("The Request is: " + parsedUrl.pathname);
    
  fs.readFile(__dirname + parsedUrl.pathname, 
    function (err, data) {
      if (err) {
        res.writeHead(500);
        return res.end('Error loading ' + parsedUrl.pathname);
      }
      res.writeHead(200);
      res.end(data);
      }
    );
}

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
    //console.log("bo0m" + socket.id);
    socket.broadcast.to(socket_rooms[socket.id]).emit('boom')
  })

  socket.on('drawing', function(data){
      //send this drawing data to EVERYONE
      //don't need to send back to the client it came from
      socket.broadcast.emit('otherdrawing', data);
    });

})
