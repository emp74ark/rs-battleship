import { Color, ServerType } from '../entities/enums.js';

export const msgServerStart = (type: ServerType, port: number) => {
  console.log(Color.FgMagenta, `${type} server starts on ${port} port`, Color.Reset);
};
