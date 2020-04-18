const MessageRelay = require('./message_relay.js');
const { MESSAGE_EVENT_NAME, TOPIC_KEY, DATA_KEY } = require('./constants');

test('Topic name does not initially exist in subscriptions list ', () => {
  const messageRelay = new MessageRelay();
  expect(messageRelay.subscriptions).not.toContain('status');
});

test('Topic name is added to subscriptions list after subscribe', () => {
  const messageRelay = new MessageRelay();
  messageRelay.subscribeToTopic('0001', 'status');
  expect(messageRelay.subscriptions).toHaveProperty('status');
});

test('Socket ID is added to subscriptions list for topic after subscribe', () => {
  const messageRelay = new MessageRelay();
  messageRelay.subscribeToTopic('0001', 'status');
  expect(messageRelay.subscriptions['status']).toContain('0001');
});

test('Socket ID is removed from subscriptions list for topic after unsubscribe when other subscribers remain', () => {
  const messageRelay = new MessageRelay();
  messageRelay.subscribeToTopic('0001', 'status');
  messageRelay.subscribeToTopic('0002', 'status');
  messageRelay.unsubscribeFromTopic('0001', 'status');
  expect(messageRelay.subscriptions['status']).not.toContain('0001');
});

test('Performing unsubscribe is a no-op if not already subscribed to that topic', () => {
  const messageRelay = new MessageRelay();
  messageRelay.unsubscribeFromTopic('0001', 'status');
  expect(messageRelay.subscriptions).not.toHaveProperty('status');
});


test('Socket ID is removed from subscriptions list for all topics when unsubscribeFromAllTopics', () => {
  const messageRelay = new MessageRelay();
  messageRelay.subscribeToTopic('0001', 'status');
  messageRelay.subscribeToTopic('0001', 'other_topic');
  messageRelay.unsubscribeFromAllTopics('0001');
  expect(messageRelay.subscriptions).not.toContain('status');
  expect(messageRelay.subscriptions).not.toContain('other_topic');
});

test('Socket ID is not removed from subscriptions list for topic after unsubscribe for a different socket ID', () => {
  const messageRelay = new MessageRelay();
  messageRelay.subscribeToTopic('0001', 'status');
  messageRelay.subscribeToTopic('0002', 'status');
  messageRelay.unsubscribeFromTopic('0001', 'status');
  expect(messageRelay.subscriptions['status']).toContain('0002');
});

test('Topic is removed from subscriptions after the last subscriber unsubscribes', () => {
  const messageRelay = new MessageRelay();
  messageRelay.subscribeToTopic('0001', 'status');
  expect(messageRelay.subscriptions).toHaveProperty('status');
  messageRelay.unsubscribeFromTopic('0001', 'status');
  expect(messageRelay.subscriptions).not.toHaveProperty('status');
});

test('Socket ID is not removed from subscriptions list for topic after unsubscribeFromAllTopics for a different socket ID', () => {
  const messageRelay = new MessageRelay();
  messageRelay.subscribeToTopic('0001', 'status');
  messageRelay.subscribeToTopic('0002', 'status');
  messageRelay.unsubscribeFromAllTopics('0001');
  expect(messageRelay.subscriptions['status']).toContain('0002');
});

test('All subscribers notified when published to subscribed topic', () => {
  const messageRelay = new MessageRelay();
  const data = {'engines': 'online'};
  const mockEmit = jest.fn();
  const mockIo = {to: jest.fn().mockReturnValue({ emit: mockEmit })};
  messageRelay.subscribeToTopic('0001', 'status');
  messageRelay.subscribeToTopic('0002', 'status');
  messageRelay.publishToTopic(mockIo, 'status', data);
  expect(mockIo.to).toHaveBeenCalledWith('0001');
  expect(mockIo.to).toHaveBeenCalledWith('0002');
  expect(mockEmit).toHaveBeenCalledWith(MESSAGE_EVENT_NAME, {[TOPIC_KEY]: 'status', [DATA_KEY]: data})
});

test('Publish to a topic with no subscribers does not publish to other topic', () => {
  const messageRelay = new MessageRelay();
  const data = {'engines': 'online'};
  const mockEmit = jest.fn();
  const mockIo = {to: jest.fn().mockReturnValue({ emit: mockEmit })};
  messageRelay.subscribeToTopic('0001', 'status');
  messageRelay.publishToTopic(mockIo, 'other_topic', data);
  expect(mockIo.to).not.toHaveBeenCalled();
  expect(mockEmit).not.toHaveBeenCalled();
});