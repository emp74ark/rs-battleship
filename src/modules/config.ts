import { config } from 'dotenv';

config();

export const HTTP_PORT = Number(process.env.HTTP_PORT) || 8181;
export const WS_PORT = Number(process.env.WS_PORT) || 8080;
