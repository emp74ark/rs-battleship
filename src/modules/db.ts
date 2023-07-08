import { msgDbMessage, msgDebug } from './messages.js';
import { obj2string, str2obj } from './utils.js';
import { IDb, IUser } from '../entities/interfaces.js';
import { WsAction } from '../entities/enums.js';

const db: IDb = {
  users: [],
  rooms: [],
};

const userLogin = (data: string, id: number) => {
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
  db.users.push({name, password, index})

  msgDbMessage(`user '${name}' was created`);

  msgDebug(db)

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

const createRoom = () => {
  const id = db.rooms.length
  const roomUsers: Omit<IUser, 'password'>[] = [];
  db.users.forEach(({name, index}) => roomUsers.push({name, index}))
  db.rooms.push({id, roomUsers})

  msgDebug(db)

  msgDbMessage(`room with id '${id}' was created`);

  return id;
}

const getRoom = (roomId: number) => {
  return db.rooms.filter(room => room.id === roomId);
}

export {
  userLogin,
  createRoom,
  getRoom,
}
