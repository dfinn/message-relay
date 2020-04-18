const http = require('http').createServer();
const io = require('socket.io')(http);
const MessageRelay = require('./message_relay.js');
const ConnectionManager = require('./connection_manager.js');

if (process.env['API_KEY'] === undefined) {
  console.log(`Must provide environment variable API_KEY`);
  process.exit(1);
} else {
  const messageRelay = new MessageRelay();
  const connectionManager = new ConnectionManager(process.env.API_KEY, io, messageRelay);
  http.listen(3000, () => console.log('listening on *:3000')); 
}