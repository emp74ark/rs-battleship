import { msgServerStart, msgServerStop, msgWsRequest } from '../modules/messages.js';
import { ServerType } from '../entities/enums.js';
import { WS_PORT } from '../modules/config.js';
import { WebSocketServer } from 'ws';
import { actionsRouter } from '../modules/actions.js';
import { obj2string } from '../modules/utils.js';

export const startWsServer = () => {
  const wss = new WebSocketServer({ port: WS_PORT });

  msgServerStart(ServerType.ws, WS_PORT);

  wss.on('connection', (ws, request) => {
    msgWsRequest(request);
    ws.on('message', async (data) => {
      const response = actionsRouter(data);
      if (response) ws.send(obj2string(response));
    });
  });

  wss.on('close', () => {
    msgServerStop(ServerType.ws);
  });

  process.on('SIGINT', () => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) client.close();
    });
    wss.close();
  });
};
