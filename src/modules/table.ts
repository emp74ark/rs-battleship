import { IShip } from '../entities/interfaces.js';
import { AttackResult } from '../entities/enums.js';

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

export const attackTarget = (x: number, y: number, table: number[][]) => {
  const target = {
    shot: false,
    killed: false
  }
  if (table[y][x]) target.shot = true

  return target.shot ? AttackResult.shot : AttackResult.miss
}
