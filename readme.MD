Simple pub/sub message relay implemented using socket.io

# Running the server:
Specify the API key that clients must provide via an environment variable called API_KEY. Example:
```
API_KEY=12345 node main.js
```

See the script 'run_local_docker' for an example of runnning within a Docker container with API key '12345'.

There are no granular permissions - any caller with the correct API key can subscribe or publish to any topic.

# Client Usage
Clients establish connection using one of the socket.io client libraries.  To send commands to the server, the emit message "message" with data structured as below for the appropriate command.  The api_key must be provided in each message. 

### subscribe
Subscribe to a specified topic.
When a client receives a message on a topic it has subscribed to, it will receive a "message" event from the socket.io connection.
When a client terminates, it will automatically be unsubscribed from any topics it had subscribed to.
```
{
  "api_key": <string>,
  "command": "subscribe",
  "topic": <string>
}
```

### unsubscribe
Unsubscribe from a specified topic.
```
{
  "api_key": <string>,
  "command": "unsubscribe",
  "topic": <string>
}
```

### publish
Publish a message to a specified topic.  The data can be any type of object.
```
{
  "api_key": <string>,
  "command": "publish",
  "topic": <string>,
  "data": <object>
}
```

# Sample code

### Subscriber:
```
const io = require('socket.io-client');
const socket = io('http://localhost:3000');
socket.emit('message', {'api_key': '12345', 'command': 'subscribe', 'topic': 'status'});
socket.on('message', (data) => {
  console.log('Received: %j', data);
});
```

### Publisher:
```
const io = require('socket.io-client');
const socket = io('http://localhost:3000');
socket.emit('message', {'api_key': '12345', 'command': 'subscribe', 'topic': 'status'});
socket.on('message', (data) => {
  console.log('Received: %j', data);
});
```

