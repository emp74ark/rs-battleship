import { Color, ServerType } from '../entities/enums.js';
import { IncomingMessage } from 'http';
import { RawData } from 'ws';

export const msgServerStart = (type: ServerType, port: number) => {
  console.log(Color.FgMagenta, `${type} server starts on ${port} port`, Color.Reset);
};

export const msgServerStop = (type: ServerType) => {
  console.log(Color.FgMagenta, `${type} server stops`, Color.Reset);
};

export const msgWsRequest = (request: IncomingMessage) => {
  const origin = request.rawHeaders.indexOf('Origin') + 1;
  console.log(Color.FgYellow, `New connection from ${request.rawHeaders[origin]}`, Color.Reset);
};

export const msgWsMessage = (message: RawData) => {
  console.log(`Client: ${message.toString()}`);
};
