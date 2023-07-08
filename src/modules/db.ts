import { msgDbMessage, msgDebug } from './messages.js';
import { obj2string, str2obj } from './utils.js';
import { IDb } from '../entities/interfaces.js';
import { WsAction } from '../entities/enums.js';

const db: IDb = {
  users: [],
  rooms: [],
  games: [],
};

const userLogin = (data: string, id: number, uuid: number) => {
  const {name, password} = str2obj(data)
  const existUser = db.users.find(user => user.name === name)

  if (existUser && existUser.password !== password) {
    return {
      type: WsAction.reg,
      data: obj2string({
        error: true,
        errorText: 'Wrong password',
      }),
      id,
    };
  }

  const index = db.users.length;
  db.users.push({name, password, index, uuid})

  msgDbMessage(`user '${name}' was created`);

  return {
    type: WsAction.reg,
    data: obj2string({
      name,
      index,
      error: false,
    }),
    id,
  };
}

const getUser = (uuid: number) => {
  return db.users.find(user => user.uuid === uuid);
}

const getOpposer = (uuid: number) => {
  return db.users.find(user => user.uuid !== uuid);
}

const createRoom = (uuid: number) => {
  const id = db.rooms.length
  db.rooms.push({id, roomUsers: []})
  msgDbMessage(`room with id '${id}' was created`);
  return id;
}

const addToRoom = (roomId: number, uuid: number) => {
  const user = getUser(uuid);
  db.rooms.map(room => {
    if (room.id === roomId && user && !room.roomUsers.includes(user)) {
      room.roomUsers = [...room.roomUsers, user];
    }
  })
}

const getRoom = (roomId: number) => {
  return db.rooms.filter(room => room.id === roomId);
}

const createGame = () => {
  const gameId = db.games.length;
  db.games.push({gameId})
  return gameId;
}

const addShips = (data: string) => {
  const {gameId, ships, indexPlayer} = str2obj(data)
  const game = db.games.find(game => game.gameId === gameId);

  if (game && game.indexPlayer === undefined || game && game.indexPlayer === indexPlayer) {
    db.games.map(game => {
      game.ships = ships;
      game.indexPlayer = indexPlayer;
    })
  }

  else if (game && game.indexPlayer !== indexPlayer) {
    db.games.push({
      gameId,
      ships,
      indexPlayer
    })
  }

  msgDebug(db)
}

const getShips = (uuid: number) => {
  const indexPlayer = getUser(uuid)?.index
  if (indexPlayer) {
    return {
      ships: db.games.find(game => game.indexPlayer === indexPlayer)?.ships,
      indexPlayer,
    }
  }
}

export {
  userLogin,
  createRoom,
  getRoom,
  addToRoom,
  getUser,
  getOpposer,
  createGame,
  addShips,
  getShips
}
