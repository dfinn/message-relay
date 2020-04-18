const { API_KEY_KEY, COMMAND_KEY, TOPIC_KEY, DATA_KEY, SUBSCRIBE_COMMAND, UNSUBSCRIBE_COMMAND, PUBLISH_COMMAND, 
  CONNECTED_EVENT_NAME, DISCONNECT_EVENT_NAME, MESSAGE_EVENT_NAME, SUCCESS_RESPONSE, INVALID_API_KEY_RESPONE } = require('./constants.js');

module.exports = class ConnectionManager {

  constructor(expectedApiKey, io, messageRelay) {
    this.expectedApiKey = expectedApiKey;
    this.io = io;
    this.messageRelay = messageRelay;
    this.configureConnection = this.configureConnection.bind(this);
    io.on(CONNECTED_EVENT_NAME, this.configureConnection);
  }

  /** When a new incoming Socket.io connection is established, configure 'disconnect' and 'message' callbacks for it. */
  configureConnection(socket) {
    const socketId = socket.id;
    const connectionManager = this;
    console.log(`a user connected with ID ${socketId}`);

    socket.on(DISCONNECT_EVENT_NAME, () => {
      console.log(`Client ${socketId} has disconneted`);
      this.messageRelay.unsubscribeFromAllTopics(socketId);
    });

    socket.on(MESSAGE_EVENT_NAME, function(msg, callback) {
      connectionManager.processMessage(socketId, msg, callback);
    });
  }

  /** Process a message received from the socket.io connection */
  processMessage(socketId, msg, callback) {
    const apiKey = msg[API_KEY_KEY];
    const command = msg[COMMAND_KEY];
    const topic = msg[TOPIC_KEY];
    const data = msg[DATA_KEY];
    console.log('  Command: %s', command);
    console.log('  Topic: %s', topic);
    console.log('  Data: %o', data);
    if (apiKey === this.expectedApiKey) {
      this.processCommand(socketId, command, topic, data);
      if (callback !== undefined) callback(SUCCESS_RESPONSE);
    } else {
      console.log('*** Invalid API key, request rejected');
      if (callback !== undefined) callback(INVALID_API_KEY_RESPONE);
    }
  }

  processCommand(socketId, command, topic, data) {
    if (command === SUBSCRIBE_COMMAND) {
      console.log(`Received subscribe request from client ${socketId} to topic '${topic}'`);
      this.messageRelay.subscribeToTopic(socketId, topic);
    } else if (command == PUBLISH_COMMAND) {
      console.log(`Received publish request from client ${socketId} for topic '${topic}':`);
      this.messageRelay.publishToTopic(this.io, topic, data);
    } else if (command == UNSUBSCRIBE_COMMAND) {
      console.log(`Received unsubscribe request from client ${socketId} for topic '${topic}'`);
      this.messageRelay.unsubscribeFromTopic(socketId, topic);
    }
  }
}