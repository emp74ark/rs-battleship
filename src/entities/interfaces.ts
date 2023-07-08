export interface IUser {
  name: string,
  password: string,
  index: number,
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
export interface IDb {
  users: IUser[],
  rooms: IRoom[],
  game?: {
    players: string[],
    board: string;
    ships: IShip[],
  }
}
