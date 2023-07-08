export interface IUser {
  name: string,
  password: string,
  index: number,
  uuid: number,
}

export interface IShip {
  size: number,
  x: number,
  y: number,
}

export interface IRoom {
  id: number,
  roomUsers: Omit<IUser, 'password'>[],
}

export interface IGame {
  id: number,
  players?: string[],
  board?: string;
  ships?: IShip[],
}
export interface IDb {
  users: IUser[],
  rooms: IRoom[],
  games: IGame[]
}
