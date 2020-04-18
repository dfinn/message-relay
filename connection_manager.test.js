const ConnectionManager = require('./connection_manager.js');
const EventEmitter = require('events');
const MessageRelay = require('./message_relay');
jest.mock('./message_relay');
const { CONNECTED_EVENT_NAME, DISCONNECT_EVENT_NAME, API_KEY_KEY, COMMAND_KEY, SUBSCRIBE_COMMAND, UNSUBSCRIBE_COMMAND, TOPIC_KEY, MESSAGE_EVENT_NAME, PUBLISH_COMMAND, DATA_KEY } = require('./constants.js');

afterEach(() => {
  jest.restoreAllMocks();
});

test('Request with invalid API key is rejected', done => {
  function callback(data) {
    try {
      expect(data).toBe('invalid_api_key');
      done()
    } catch(error) {
      done(error);
    }
  }
  const mockIo = {on: jest.fn()};
  const connectionManager = new ConnectionManager('12345', mockIo, jest.fn());
  connectionManager.processMessage('0001', {api_key: '789', command: 'subscribe', topic: 'status'}, callback)
});

test('Request with valid API key is processed', done => {
  function callback(data) {
    try {
      expect(data).toBe('ok');
      done()
    } catch(error) {
      done(error);
    }
  }
  const mockIo = {on: jest.fn()};
  const mockMessageRelay = {subscribeToTopic: jest.fn(), unsubscribeFromAllTopics: jest.fn()};
  const connectionManager = new ConnectionManager('12345', mockIo, mockMessageRelay);
  connectionManager.processMessage('0001', {api_key: '12345', command: 'subscribe', topic: 'status'}, callback)
});

test('Connection event callback configured when ConnectionManager created', () => {
  const mockIo = {on: jest.fn()};
  const connectionManager = new ConnectionManager('12345', mockIo, jest.fn());
  expect(mockIo.on).toHaveBeenCalled();
  expect(mockIo.on.mock.calls[0][0]).toBe(CONNECTED_EVENT_NAME);
  expect(mockIo.on.mock.calls[0][1]).toBe(connectionManager.configureConnection);
});

test('Calls unsubscribeFromAllTopics when client disconnects', () => {
  const fakeIo = new EventEmitter();
  const mockMessageRelay = {subscribeToTopic: jest.fn(), unsubscribeFromAllTopics: jest.fn()};
  const fakeSocket = new EventEmitter();
  fakeSocket.id = 42;
  const connectionManager = new ConnectionManager('12345', fakeIo, mockMessageRelay);
  connectionManager.configureConnection(fakeSocket);
  fakeSocket.emit(DISCONNECT_EVENT_NAME);
  expect(mockMessageRelay.unsubscribeFromAllTopics).toHaveBeenCalled();
  expect(mockMessageRelay.unsubscribeFromAllTopics.mock.calls[0][0]).toBe(fakeSocket.id);
});

test('Command is processed when message event is received from client socket', () => {
  const fakeIo = new EventEmitter();
  const mockMessageRelay = {subscribeToTopic: jest.fn(), unsubscribeFromAllTopics: jest.fn()};
  const fakeSocket = new EventEmitter();
  fakeSocket.id = 42;
  const connectionManager = new ConnectionManager('12345', fakeIo, mockMessageRelay);
  fakeIo.emit(CONNECTED_EVENT_NAME, fakeSocket);
  const msg = {[API_KEY_KEY]: '12345', [COMMAND_KEY]: SUBSCRIBE_COMMAND, [TOPIC_KEY]: 'status'};
  fakeSocket.emit(MESSAGE_EVENT_NAME, msg, () => {});
  expect(mockMessageRelay.subscribeToTopic).toHaveBeenCalled();
});

test('Command, topic, and data are correctly extracted when message is processed', () => {
  const fakeIo = new EventEmitter();
  const mockMessageRelay = {subscribeToTopic: jest.fn(), unsubscribeFromAllTopics: jest.fn(), publishToTopic: jest.fn()};
  const connectionManager = new ConnectionManager('12345', fakeIo, mockMessageRelay);
  const topicName = 'status';
  const data = {'battery_level': 99};
  const msg = {[API_KEY_KEY]: '12345', [COMMAND_KEY]: PUBLISH_COMMAND, [TOPIC_KEY]: topicName, [DATA_KEY]: data};
  connectionManager.processMessage(42, msg, () => {});
  expect(mockMessageRelay.publishToTopic).toHaveBeenCalled();
  expect(mockMessageRelay.publishToTopic.mock.calls[0][0]).toBe(fakeIo);
  expect(mockMessageRelay.publishToTopic.mock.calls[0][1]).toBe(topicName);
  expect(mockMessageRelay.publishToTopic.mock.calls[0][2]).toBe(data);
});

test('subscribeToTopic is called when subscribe command received', () => {
  const fakeIo = new EventEmitter();
  const mockMessageRelay = new MessageRelay();
  const connectionManager = new ConnectionManager('12345', fakeIo, mockMessageRelay);
  connectionManager.processCommand(42, SUBSCRIBE_COMMAND, 'status', {});
  expect(mockMessageRelay.subscribeToTopic).toHaveBeenCalled();
});

test('publishToTopic is called when publish command received', () => {
  const fakeIo = new EventEmitter();
  const mockMessageRelay = new MessageRelay();
  const connectionManager = new ConnectionManager('12345', fakeIo, mockMessageRelay);
  connectionManager.processCommand(42, PUBLISH_COMMAND, 'status', {});
  expect(mockMessageRelay.publishToTopic).toHaveBeenCalled();
});

test('unsubscribeFromTopic is called when unsubscribe command received', () => {
  const fakeIo = new EventEmitter();
  const mockMessageRelay = new MessageRelay();
  const connectionManager = new ConnectionManager('12345', fakeIo, mockMessageRelay);
  connectionManager.processCommand(42, UNSUBSCRIBE_COMMAND, 'status', {});
  expect(mockMessageRelay.unsubscribeFromTopic).toHaveBeenCalled();
});