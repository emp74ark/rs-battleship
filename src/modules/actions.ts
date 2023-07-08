import { RawData } from 'ws';
import { addToRoom, createGame, createRoom, getRoom, getUser, userLogin } from './db.js';
import { buf2obj, obj2string } from './utils.js';
import { msgDebug } from './messages.js';
import { WsAction } from '../entities/enums.js';

export const actionsRouter = (clientData: RawData, uuid: number) => {
  const { type, data, id } = buf2obj(clientData);

  msgDebug(buf2obj(clientData));

  switch (type) {
    case WsAction.reg:
      return [userLogin(data, id, uuid)];
    case WsAction.create_room:
      const roomId = createRoom(uuid);
      addToRoom(roomId, uuid);
      return [{
        type: WsAction.update_room,
        data: obj2string(getRoom(roomId)),
        id,
      }];
    case WsAction.add_user_to_room:
      addToRoom(0, uuid);
      return [
        {
          type: WsAction.update_room,
          data: obj2string(getRoom(0)), // fixme: where roomId should be taken?
          id,
        },
        {
          type: WsAction.create_game,
          data: obj2string({
              idGame: createGame(),
              idPlayer: getUser(uuid),
            }),
          id: 0,
        },
      ];
    default:
      console.log('Default action');
  }
};
