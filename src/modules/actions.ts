import { RawData } from 'ws';
import {
  addShips,
  addToRoom, attackAcceptor,
  createGame,
  createRoom,
  getOpposer,
  getRoom,
  getShips,
  getUser,
  userLogin,
} from './db.js';
import { buf2obj, obj2string } from './utils.js';
import { msgDebug } from './messages.js';
import { BroadcastType, WsAction } from '../entities/enums.js';

export const actionsRouter = (clientData: RawData, uuid: number) => {
  const { type, data, id } = buf2obj(clientData);

  msgDebug(buf2obj(clientData));

  switch (type) {
    case WsAction.reg:
      return [
        {
          ...userLogin(data, id, uuid),
          broadcast: BroadcastType.personal,
        },
      ];
    case WsAction.create_room:
      const roomId = createRoom(uuid);
      addToRoom(roomId, uuid);

      return [
        {
          type: WsAction.update_room,
          data: obj2string(getRoom(roomId)),
          id,
          broadcast: BroadcastType.public,
        },
      ];
    case WsAction.add_user_to_room:
      addToRoom(0, uuid);
      const idGame = createGame();
      return [
        {
          type: WsAction.create_game,
          data: obj2string({
            idGame,
            idPlayer: getUser(uuid)?.index,
          }),
          id: 0,
          broadcast: BroadcastType.personal,
        },
        {
          type: WsAction.create_game,
          data: obj2string({
            idGame,
            idPlayer: getOpposer(uuid)?.index,
          }),
          id: 0,
          broadcast: BroadcastType.opposer,
        },
        {
          type: WsAction.update_room,
          data: obj2string(getRoom(0)), // fixme: where roomId should be taken?
          id,
          broadcast: BroadcastType.public,
        },
      ];
    case WsAction.add_ships:
      addShips(data)
      const ships = getShips(uuid)
      if (ships && ships.players > 1) {
        return [
          {
            type: WsAction.start_game,
            data: obj2string(ships || {}),
            id,
            broadcast: BroadcastType.public,
          }
        ];
      }
      break;
    case WsAction.attack:
      const attack = attackAcceptor(data, uuid);
      return [{
        type: WsAction.attack,
        data: obj2string(attack),
        id,
        broadcast: BroadcastType.opposer,
      }]
    default:
      console.log('Default action');
  }
};
