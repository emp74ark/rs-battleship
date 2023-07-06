import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import { HTTP_PORT } from '../modules/config.js';
import { msgServerStart } from '../modules/messages.js';
import { ServerType } from '../entities/enums.js';

export const httpServer = http.createServer(function (req, res) {
  const __dirname = path.resolve(path.dirname(''));
  const file_path = __dirname + (req.url === '/' ? '/front/index.html' : '/front' + req.url);
  fs.readFile(file_path, function (err, data) {
    if (err) {
      res.writeHead(404);
      res.end(JSON.stringify(err));
      return;
    }
    res.writeHead(200);
    res.end(data);
  });
});

export const startHttpServer = () => {
  httpServer.listen(HTTP_PORT);
  msgServerStart(ServerType.http, HTTP_PORT);
};
