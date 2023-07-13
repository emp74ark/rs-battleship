import { RawData } from 'ws';
import { IUser } from '../entities/interfaces.js';

export const buf2obj = (buf: RawData | Buffer) => {
  const { type, data, id } = JSON.parse(buf.toString());
  return {
    type,
    data,
    id,
  };
};

export const str2obj = (str: string) => {
  return JSON.parse(str);
};

export const obj2string = (obj: object | object[]) => {
  return JSON.stringify(obj);
};

export const botCheck = (user?: IUser) => {
  return !!user?.name.startsWith('battleShipBot-');
};

export const randomCoordinate = () => {
  return {
    x: Math.floor(Math.random() * 10),
    y: Math.floor(Math.random() * 10),
  };
};
