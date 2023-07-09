import { RawData } from 'ws';
import {
  addShips,
  addToRoom,
  attackAcceptor,
  createGame,
  createRoom,
  getOpposer,
  getRoom,
  getShips,
  getUser,
  userLogin,
} from './db.js';
import { buf2obj, obj2string, str2obj } from './utils.js';
import { msgDebug } from './messages.js';
import { AttackResult, BroadcastType, WsAction } from '../entities/enums.js';

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
      addShips(data);
      const ships = getShips(uuid);
      if (ships && ships.players > 1) {
        return [
          {
            type: WsAction.start_game,
            data: obj2string(ships || {}),
            id,
            broadcast: BroadcastType.public,
          },
          {
            type: WsAction.turn,
            data: obj2string({
              currentPlayer: getUser(uuid)?.index,
            }),
            id,
            broadcast: BroadcastType.personal,
          },
        ];
      }
      break;
    case WsAction.attack:
      const attack = attackAcceptor(data, uuid);
      return [
        {
          type: WsAction.attack,
          data: obj2string(attack),
          id,
          broadcast: BroadcastType.opposer,
        },
        {
          type: WsAction.turn,
          data: obj2string({
            currentPlayer: attack.status !== AttackResult.miss ? getUser(uuid)?.index : getOpposer(uuid)?.index,
          }),
          id,
          broadcast: attack.status !== AttackResult.miss ? BroadcastType.personal : BroadcastType.opposer,
        },
      ];
    case WsAction.randomAttack:
      const dataWithPosition = obj2string({
        ...str2obj(data),
        x: Math.floor(Math.random() * 9),
        y: Math.floor(Math.random() * 9),
      })
      const randomAttack = attackAcceptor(dataWithPosition, uuid);
      return [
        {
          type: WsAction.attack,
          data: obj2string(randomAttack),
          id,
          broadcast: BroadcastType.opposer,
        },
        {
          type: WsAction.turn,
          data: obj2string({
            currentPlayer: randomAttack.status !== AttackResult.miss ? getUser(uuid)?.index : getOpposer(uuid)?.index,
          }),
          id,
          broadcast: randomAttack.status !== AttackResult.miss ? BroadcastType.personal : BroadcastType.opposer,
        },
      ];
    default:
      console.log('Default action');
  }
};
