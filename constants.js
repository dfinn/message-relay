/* Name of environment variable or property within server requests specifying the API key. */
module.exports.API_KEY_KEY = 'api_key';

/* Name of a property in a server request specifying the command (publish, subscribe, unpublish). */
module.exports.COMMAND_KEY = 'command';

/* Command names in client requests  */
module.exports.SUBSCRIBE_COMMAND = 'subscribe';
module.exports.UNSUBSCRIBE_COMMAND = 'unsubscribe';
module.exports.PUBLISH_COMMAND = 'publish';

/* Name of a property in a server request specifying the topic name. */
module.exports.TOPIC_KEY = 'topic';

/* Name of a property within a publish request containing the data to publish. **/
module.exports.DATA_KEY = 'data';

/* Event name emitted on Socket.io when client has connected */
module.exports.CONNECTED_EVENT_NAME = 'connection';

/* Event name emitted on Socket.io containing the request from client to server or the response from server to client */
module.exports.MESSAGE_EVENT_NAME = 'message';

/* Event name emitted on Socket.io when client has disconnected */
module.exports.DISCONNECT_EVENT_NAME = 'disconnect';

/* Server response indicating command was processed successfully */
module.exports.SUCCESS_RESPONSE = 'ok';

/* Server response indicating command was rejected because of invalid API key in the client request */
module.exports.INVALID_API_KEY_RESPONE = 'invalid_api_key';