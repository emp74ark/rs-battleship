import { RawData } from 'ws';

export const buf2obj = (buf: RawData | Buffer) => {
  const { type, data, id } = JSON.parse(buf.toString())
  return {
    type,
    data,
    id
  }
}

export const str2obj = (str: string) => {
  return JSON.parse(str);
}

export const obj2string = (obj: object | object[]) => {
  return JSON.stringify(obj)
}
