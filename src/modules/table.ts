import { IShip } from '../entities/interfaces.js';
import { AttackResult } from '../entities/enums.js';
import { msgDebug } from './messages.js';

export const shipsTable = (data: IShip[]) => {
  const table: number[][] = new Array(10);
  for (let i = 0; i < 10; i++) {
    table[i] = new Array(10).fill(0);
  }
  data.forEach(({ position: { x, y }, direction, length }) => {
    for (let p = 0; p < length; p++) {
      table[y + (direction ? p : 0)][x + (direction ? 0 : p)] = 1;
    }
  });
  return table;
};

const checkKilled = (x: number, y: number, table: number[][]) => {
  const lowerY = y - (y > 0 ? 1 : 0);
  const higherY = y + (y < 9 ? 1 : 0);
  const lowerX = x - (x > 0 ? 1 : 0);
  const higherX = x + (x < 9 ? 1 : 0);
  return table[lowerY][x] !== 1 && table[higherY][x] !== 1 && table[y][lowerX] !== 1 && table[y][higherX] !== 1;
};

export const attackTarget = (x: number, y: number, table: number[][]) => {
  const result = {
    attack: AttackResult.shot,
    table,
  };

  if (table[y][x] !== 0) {
    table[y][x] = 2;
    result.attack = checkKilled(x, y, table) ? AttackResult.killed : AttackResult.shot;
  } else {
    result.attack = AttackResult.miss;
  }

  return result;
};
