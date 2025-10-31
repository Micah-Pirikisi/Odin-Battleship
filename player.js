import Gameboard from "./gameboard.js";

export default class Player {
  constructor(isComputer = false) {
    this.board = new Gameboard();
    this.isComputer = isComputer;
    if (this.isComputer) {
      this.tried = new Set(); // coords tried by computer AI
      this.targetQueue = []; // coords to try next (after a hit)
    }
  }

  attack(enemyBoard, coords) {
    if (this.isComputer) {
      // choose a coord: priority from targetQueue, otherwise random untried
      let choice;
      while (true) {
        if (this.targetQueue.length > 0) {
          choice = this.targetQueue.shift();
        } else {
          choice = this.generateRandomCoords();
        }
        const key = `${choice[0]},${choice[1]}`;
        if (!this.tried.has(key)) break;
        // otherwise continue to next candidate
      }
      const key = `${choice[0]},${choice[1]}`;
      this.tried.add(key);
      const result = enemyBoard.receiveAttack(choice);

      // react to result
      if (result.hit) {
        if (!result.shipSunk) {
          // add adjacent orthogonal cells to queue
          const [x, y] = choice;
          const adj = [
            [x + 1, y],
            [x - 1, y],
            [x, y + 1],
            [x, y - 1],
          ];
          for (const [ax, ay] of adj) {
            if (ax >= 0 && ax < 10 && ay >= 0 && ay < 10) {
              const k = `${ax},${ay}`;
              if (
                !this.tried.has(k) &&
                !this.targetQueue.some((c) => c[0] === ax && c[1] === ay)
              ) {
                this.targetQueue.push([ax, ay]);
              }
            }
          }
        } else {
          // ship sunk: clear queue (don't try around sunk ship)
          this.targetQueue = [];
        }
      }

      return result;
    }
    return enemyBoard.receiveAttack(coords);
  }

  generateRandomCoords() {
    if (!this.isComputer) {
      const x = Math.floor(Math.random() * 10);
      const y = Math.floor(Math.random() * 10);
      return [x, y];
    }
    // computer: avoid already tried coords
    let x, y, key;
    do {
      x = Math.floor(Math.random() * 10);
      y = Math.floor(Math.random() * 10);
      key = `${x},${y}`;
    } while (this.tried && this.tried.has(key));
    return [x, y];
  }
}
