import { RawData } from 'ws';
import {
  addShips,
  addToRoom,
  addWinner,
  attackAcceptor,
  createGame,
  createRoom,
  getOpposer,
  getRoom,
  getShips,
  getUser,
  getWinner,
  userLogin,
} from './db.js';
import { buf2obj, obj2string, str2obj } from './utils.js';
import { AttackResult, BroadcastType, WsAction } from '../entities/enums.js';
import { msgDebug } from './messages.js';

let turn: number | undefined;

export const actionsRouter = (clientData: RawData, uuid: number) => {
  const { type, data, id } = buf2obj(clientData);
  const attacker = getUser(uuid);
  const opposer = getOpposer(uuid);

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
      const room = getRoom(0);
      if (room[0].roomUsers.length < 2) {
        return [
          {
            type: WsAction.update_room,
            data: obj2string(room),
            id,
            broadcast: BroadcastType.public,
          },
        ];
      } else {
        const idGame = createGame();
        return [
          {
            type: WsAction.create_game,
            data: obj2string({
              idGame,
              idPlayer: attacker?.index,
            }),
            id: 0,
            broadcast: BroadcastType.personal,
          },
          {
            type: WsAction.create_game,
            data: obj2string({
              idGame,
              idPlayer: opposer?.index,
            }),
            id: 0,
            broadcast: BroadcastType.opposer,
          },
          {
            type: WsAction.update_room,
            data: obj2string(room),
            id,
            broadcast: BroadcastType.public,
          },
        ];
      }
    // case WsAction.single_play:
    //   const idGame = createGame();
    //   return [
    //     {
    //       type: WsAction.create_game,
    //       data: obj2string({
    //         idGame,
    //         idPlayer: attacker?.index,
    //       }),
    //       id: 0,
    //       broadcast: BroadcastType.personal,
    //     },
    //     {
    //       type: WsAction.update_room,
    //       data: obj2string(getRoom(0)),
    //       id,
    //       broadcast: BroadcastType.public,
    //     },
    //   ];
    case WsAction.add_ships:
      addShips(data);
      const ships = getShips(uuid);
      msgDebug(uuid)
      if (ships && ships.players > 1) {
        turn = attacker?.uuid;
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
              currentPlayer: attacker?.index,
            }),
            id,
            broadcast: BroadcastType.personal,
          },
        ];
      }
      break;
    case WsAction.attack:

      if (uuid !== turn) {
        msgDebug('It is not your turn')
        return false;
      }

      const attack = attackAcceptor(data, uuid);
      turn = attack.status !== AttackResult.miss ? attacker?.uuid : opposer?.uuid

      if (!attack.survived) {
        addWinner(attacker?.index);
        return [
          {
            type: WsAction.finish,
            data: obj2string({ winPlayer: attacker?.index }),
            id,
            broadcast: BroadcastType.public,
          },
          {
            type: WsAction.update_winners,
            data: obj2string([
              {
                name: attacker?.name,
                wins: getWinner(attacker?.index),
              },
            ]),
            id,
            broadcast: BroadcastType.public,
          },
        ];
      }

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
            currentPlayer: attack.status !== AttackResult.miss ? attacker?.index : opposer?.index,
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
      });

      const randomAttack = attackAcceptor(dataWithPosition, uuid);
      if (randomAttack.survived) {
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
              currentPlayer: randomAttack.status !== AttackResult.miss ? attacker?.index : opposer?.index,
            }),
            id,
            broadcast: randomAttack.status !== AttackResult.miss ? BroadcastType.personal : BroadcastType.opposer,
          },
        ];
      }
      addWinner(attacker?.index);
      return [
        {
          type: WsAction.finish,
          data: obj2string({ winPlayer: attacker?.index }),
          id,
          broadcast: BroadcastType.public,
        },
        {
          type: WsAction.update_winners,
          data: obj2string([
            {
              name: attacker?.name,
              wins: getWinner(attacker?.index),
            },
          ]),
          id,
          broadcast: BroadcastType.public,
        },
      ];
    default:
      console.log('Default action');
  }
};
