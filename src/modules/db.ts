import { msgDbMessage, msgDebug } from './messages.js';
import { obj2string, str2obj } from './utils.js';
import { IDb } from '../entities/interfaces.js';
import { WsAction } from '../entities/enums.js';
import { attackTarget, checkSurvived, shipsTable } from './table.js';

const db: IDb = {
  users: [],
  rooms: [],
  games: [],
};

const userLogin = (data: string, id: number, uuid: number) => {
  const { name, password } = str2obj(data);
  const existUser = db.users.find((user) => user.name === name);

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
  db.users.push({ name, password, index, uuid });

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
};

const getUser = (uuid: number) => {
  return db.users.find((user) => user.uuid === uuid);
};

const getOpposer = (uuid: number) => {
  return db.users.find((user) => user.uuid !== uuid);
};

const createRoom = (uuid: number) => {
  const id = db.rooms.length;
  db.rooms.push({ id, roomUsers: [] });
  msgDbMessage(`room with id '${id}' was created`);
  return id;
};

const addToRoom = (roomId: number, uuid: number) => {
  const user = getUser(uuid);
  db.rooms.map((room) => {
    if (room.id === roomId && user && !room.roomUsers.includes(user)) {
      room.roomUsers = [...room.roomUsers, user];
    }
  });
};

const getRoom = (roomId: number) => {
  return db.rooms.filter((room) => room.id === roomId);
};

const createGame = () => {
  const gameId = db.games.length;
  db.games.push({ gameId });
  return gameId;
};

const addShips = (data: string) => {
  const { gameId, ships, indexPlayer } = str2obj(data);
  const game = db.games.find((game) => game.gameId === gameId);
  const table = shipsTable(ships);

  if ((game && game.indexPlayer === undefined) || (game && game.indexPlayer === indexPlayer)) {
    db.games.map((game) => {
      game.ships = ships;
      game.table = table;
      game.indexPlayer = indexPlayer;
    });
  } else if (game && game.indexPlayer !== indexPlayer) {
    db.games.push({
      gameId,
      ships,
      table,
      indexPlayer,
    });
  }
};

const getShips = (uuid: number) => {
  const indexPlayer = getUser(uuid)?.index;
  if (indexPlayer) {
    return {
      ships: db.games.find((game) => game.indexPlayer === indexPlayer)?.ships,
      indexPlayer,
      players: db.games.length,
    };
  }
};

const attackAcceptor = (data: string, uuid: number) => {
  const currentPlayer = getUser(uuid)?.index
  const opposPlayer = getOpposer(uuid)?.index;
  const table = db.games.find((game) => game.indexPlayer === opposPlayer)?.table;

  const { x, y } = str2obj(data);
  const result = attackTarget(x, y, (table || []))

  db.games.map((game) => {
    if (game.indexPlayer === opposPlayer) game.table = result.table;
  });

  return {
    position: { x, y},
    currentPlayer,
    status: result.attack,
    survived: checkSurvived(table || [])
  }
};

export {
  userLogin,
  createRoom,
  getRoom,
  addToRoom,
  getUser,
  getOpposer,
  createGame,
  addShips,
  getShips,
  attackAcceptor,
};
