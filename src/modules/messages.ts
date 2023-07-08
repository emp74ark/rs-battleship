import { Color, ServerType } from '../entities/enums.js';
import { IncomingMessage } from 'http';

export const msgDebug = (message: any) => {
  console.log(Color.FgMagenta, '[DEBUG] ', message, Color.Reset);
}

export const msgServerStart = (type: ServerType, port: number) => {
  console.log(Color.FgMagenta, `[NET] ${type} server starts on ${port} port`, Color.Reset);
};

export const msgServerStop = (type: ServerType) => {
  console.log(Color.FgMagenta, `[NET] ${type} server stops`, Color.Reset);
};

export const msgWsRequest = (request: IncomingMessage) => {
  const origin = request.rawHeaders.indexOf('Origin') + 1;
  console.log(Color.FgYellow, `[WS] New connection from ${request.rawHeaders[origin]}`, Color.Reset);
};

export const msgDbMessage = (message: string) => {
  console.log(Color.FgGray, `[DB]: ${message}`, Color.Reset);
};
