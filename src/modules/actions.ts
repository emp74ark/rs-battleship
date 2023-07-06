import { RawData } from 'ws';
import { msgWsMessage } from './messages.js';

export const actionsRouter = (data: RawData) => {
  const {message, action} = JSON.parse(data.toString())
  switch (action) {
    case 'some_action':
      msgWsMessage(message);
      return 'Action done';
    default:
      msgWsMessage(message);
      break;
  }
};
