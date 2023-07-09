import { msgServerStart, msgServerStop, msgWsRequest } from '../modules/messages.js';
import { BroadcastType, ServerType } from '../entities/enums.js';
import { WS_PORT } from '../modules/config.js';
import { WebSocket, WebSocketServer } from 'ws';
import { actionsRouter } from '../modules/actions.js';
import { obj2string } from '../modules/utils.js';

interface ExtWs extends WebSocket {
  uuid: number;
}

export const startWsServer = () => {
  const wss = new WebSocketServer({ port: WS_PORT });

  msgServerStart(ServerType.ws, WS_PORT);

  wss.on('connection', (ws: ExtWs, request) => {
    msgWsRequest(request);
    ws.uuid = Date.now();
    ws.on('message', async (data) => {
      const response = actionsRouter(data, ws.uuid);
      if (response) {
        response.forEach((r) => {
          if (r.broadcast === BroadcastType.personal) {
            ws.send(obj2string(r));
          } else if (r.broadcast === BroadcastType.opposer) {
            wss.clients.forEach((client) => {
              if (client !== ws) client.send(obj2string(r));
            });
          } else {
            wss.clients.forEach((client) => {
              client.send(obj2string(r));
            });
          }
        });
      }
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
