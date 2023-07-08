import { msgServerStart, msgServerStop, msgWsRequest } from '../modules/messages.js';
import { ServerType, WsAction } from '../entities/enums.js';
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
    ws.uuid = Date.now()
    ws.on('message', async (data) => {
      const response = actionsRouter(data, ws.uuid);
      const privateActions = [WsAction.reg, WsAction.create_room, WsAction.add_user_to_room];
      if (response) {
        // to all
        wss.clients.forEach((client) => {
          response.forEach(i => {
            if (!privateActions.includes(i.type)) client.send(obj2string(i))
          })
        });
        // to one
        response.forEach(i => {
          if (privateActions.includes(i.type)) ws.send(obj2string(i))
        })
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
