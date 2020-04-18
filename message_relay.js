const { TOPIC_KEY, DATA_KEY, MESSAGE_EVENT_NAME } = require('./constants.js');

module.exports = class MessageRelay {

  constructor() {
    /** Dictionary of subscribers to each topic, keyed on topic name, where each entry is a Set of socket IDs subscribed to the topic. **/
    this.subscriptions = {};
  }

  /** Adds the socketId provided to the list of subscribers for the topic specified. **/
  subscribeToTopic(socketId, topic) {
      if (this.subscriptions[topic] == undefined) {
        console.log('Topic does not exist yet, creating it now');
        this.subscriptions[topic] = new Set();
      }
      this.subscriptions[topic].add(socketId);
      console.log('Subscriptions is now:')
      console.log(this.subscriptions);
  }

  /** Removes the socketId provided from the list of subscribers to the topic. 
   *  If no more subscribers are left for the topic, then also deletes the topic from the subscriptions list. 
  **/
  unsubscribeFromTopic(socketId, topic) {
    var idSet = this.subscriptions[topic];
    if (idSet !== undefined && idSet.has(socketId)) {
      idSet.delete(socketId);
      if (idSet.size == 0) {
        console.log(`No more subscribers to topic '${topic}', removing it`);
        delete this.subscriptions[topic];
      }
      console.log(`Unsubscribed client ${socketId} from topic '${topic}', subscriptions is now:`);
      console.log(this.subscriptions);    
    } else {
      console.log(`unsubscribeFromTopic(${topic}) - socketId ${socketId} is not subscribed`);
    }
  }

  /* Handle a publish request from a client: send a message to all clients subscribed to the topic. */
  publishToTopic(io, topic, data) {
    var idSet = this.subscriptions[topic];
    if (idSet == undefined) {
      console.log(`  - No subscribers to topic '${topic}', message not sent`);
    } else {
      this.subscriptions[topic].forEach(id => {
        console.log(`  - Sending message to subscriber ${id}`);
        io.to(id).emit(MESSAGE_EVENT_NAME, {[TOPIC_KEY]: topic, [DATA_KEY]: data});
      });        
    }
  }

  /** Removes the socketId from the list of subscribers for all topics. **/
  unsubscribeFromAllTopics(socketId) {
    Object.keys(this.subscriptions).forEach(topic => this.unsubscribeFromTopic(socketId, topic));
  }
}