import { RawData } from 'ws';
import { createRoom, getRoom, userLogin } from './db.js';
import { buf2obj, obj2string } from './utils.js';
import { msgDebug } from './messages.js';
import { WsAction } from '../entities/enums.js';

export const actionsRouter = (clientData: RawData) => {
  const { type, data, id } = buf2obj(clientData);

  msgDebug(buf2obj(clientData))

  switch (type) {
    case WsAction.reg:
      return userLogin(data, id);
    case WsAction.create_room:
      const roomId = createRoom();
      return {
        type: WsAction.update_room,
        data: obj2string(getRoom(roomId)),
        id,
      };
    default:
      console.log('Default action');
  }
};
