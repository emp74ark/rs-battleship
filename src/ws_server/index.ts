import { msgServerStart } from '../modules/messages.js';
import { ServerType } from '../entities/enums.js';
import { WS_PORT } from '../modules/config.js';

export const startWsServer = () => {
  msgServerStart(ServerType.ws, WS_PORT);
};
