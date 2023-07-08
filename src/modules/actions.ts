import { RawData } from 'ws';
import { createRoom, getRoom, userLogin } from './db.js';
import { buf2obj, obj2string } from './utils.js';
import { msgDebug } from './messages.js';

enum WsAction {
  reg = 'reg', // player registration/login
  create_room = 'create_room',
  single_play = 'single_play',
  create_game = 'create_game', // game id and enemy id
  start_game = 'start_game', // information about game and player's ships positions
  turn = 'turn', // who is shooting now
  attack = 'attack', // coordinates of shot and status
  finish = 'finish', // id of the winner
  update_room = 'update_room', // list of rooms and players in rooms
  update_winners = 'update_winners', // send score table to players
}

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
