export interface IUser {
  name: string;
  password: string;
  index: number;
  uuid: number;
}

export interface IShip {
  position: {
    x: number;
    y: number;
  };
  direction: boolean;
  length: number;
  type: 'small' | 'medium' | 'large' | 'huge';
}

export interface IRoom {
  id: number;
  roomUsers: Omit<IUser, 'password'>[];
}

export interface IGame {
  gameId: number;
  ships?: IShip[];
  table?: number[][];
  indexPlayer?: number;
}

export interface IDb {
  users: IUser[];
  rooms: IRoom[];
  games: IGame[];
  winners: Record<number, number>
}

export interface IAttack {
  gameID: number;
  x: number;
  y: number;
  indexPlayer: number;
}
