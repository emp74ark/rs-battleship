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
import { botCheck, buf2obj, obj2string, randomCoordinate, str2obj } from './utils.js';
import { AttackResult, BroadcastType, WsAction } from '../entities/enums.js';
import { msgDebug } from './messages.js';
import { botSender } from '../ws_server/index.js';

let turn: number | undefined;

const botData = {
  name: `battleShipBot-${Date.now()}`,
  password: `password_${Date.now}`,
};
const botUuid = Date.now();

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
      const roomId = createRoom();
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
            id,
            broadcast: BroadcastType.personal,
          },
          {
            type: WsAction.create_game,
            data: obj2string({
              idGame,
              idPlayer: opposer?.index,
            }),
            id,
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
    case WsAction.single_play:
      const bot = userLogin(obj2string(botData), id, botUuid);
      const roomWithBotId = createRoom();
      const roomWithBot = getRoom(roomWithBotId);

      addToRoom(roomWithBotId, uuid);
      addToRoom(roomWithBotId, botUuid);

      const idGame = createGame();

      return [
        {
          ...bot,
          broadcast: BroadcastType.personal,
        },
        {
          type: WsAction.update_room,
          data: obj2string(getRoom(roomWithBotId)),
          id,
          broadcast: BroadcastType.public,
        },
        {
          type: WsAction.create_game,
          data: obj2string({
            idGame,
            idPlayer: attacker?.index,
          }),
          id,
          broadcast: BroadcastType.personal,
        },
        {
          type: WsAction.create_game,
          data: obj2string({
            idGame,
            idPlayer: opposer?.index,
          }),
          id,
          broadcast: BroadcastType.opposer,
        },
        {
          type: WsAction.update_room,
          data: obj2string(roomWithBot),
          id,
          broadcast: BroadcastType.public,
        },
      ];
    case WsAction.add_ships:
      addShips(data);
      //add ships for bot
      if (botCheck(opposer)) {
        const { indexPlayer, ...rest } = str2obj(data); // todo: generate ships table
        addShips(obj2string({ ...rest, indexPlayer: opposer?.index }));
      }

      const ships = getShips(uuid);

      if (ships && ships.players > 1) {
        turn = uuid;

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
      if (uuid !== turn) {
        msgDebug('It is not your turn');
        return false;
      }

      const attack = attackAcceptor(data, uuid);
      turn = attack.status !== AttackResult.miss ? attacker?.uuid : opposer?.uuid;

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

      while (turn && botCheck(getUser(turn))) {
        const coordinates = randomCoordinate();
        const botAttack = attackAcceptor(obj2string(coordinates), botUuid);
        turn = botAttack.status === AttackResult.miss ? getOpposer(botUuid)?.uuid : getUser(botUuid)?.uuid;
        msgDebug(`Bot attack to ${coordinates.x}:${coordinates.y} result: ${botAttack.status}`);

        botSender(
          obj2string({
            type: WsAction.attack,
            data: obj2string(botAttack),
            id,
            broadcast: BroadcastType.public,
          }),
        );
        botSender(
          obj2string({
            type: WsAction.turn,
            data: obj2string({
              currentPlayer: getUser(turn!)?.index,
            }),
            id,
            broadcast: BroadcastType.public,
          }),
        );
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
        ...randomCoordinate(),
      });

      if (uuid !== turn) {
        msgDebug('It is not your turn');
        return false;
      }

      const randomAttack = attackAcceptor(dataWithPosition, uuid);
      turn = randomAttack.status !== AttackResult.miss ? attacker?.uuid : opposer?.uuid;

      if (randomAttack.survived) {

        while (turn && botCheck(getUser(turn))) {
          const coordinates = randomCoordinate();
          const botAttack = attackAcceptor(obj2string(coordinates), botUuid);
          turn = botAttack.status === AttackResult.miss ? getOpposer(botUuid)?.uuid : getUser(botUuid)?.uuid;
          msgDebug(`Bot attack to ${coordinates.x}:${coordinates.y} result: ${botAttack.status}`);

          botSender(
            obj2string({
              type: WsAction.attack,
              data: obj2string(botAttack),
              id,
              broadcast: BroadcastType.public,
            }),
          );
          botSender(
            obj2string({
              type: WsAction.turn,
              data: obj2string({
                currentPlayer: getUser(turn!)?.index,
              }),
              id,
              broadcast: BroadcastType.public,
            }),
          );
        }

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
