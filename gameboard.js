import Ship from "./ship.js";

export default class Gameboard {
  constructor() {
    this.ships = [];
    this.missedAttacks = [];
    this.board = [];
  }

  placeShip(length, coords) {
    const ship = new Ship(length);
    this.ships.push({ ship, coords });
  }

  // validate whether a ship can be placed at the provided coords
  // checks: coords are inside 0..9 and don't overlap existing ships
  canPlaceShip(coords) {
    // coords should be an array of [x,y]
    if (!Array.isArray(coords) || coords.length === 0) return false;

    // ensure coords are unique
    const seen = new Set();
    for (const [x, y] of coords) {
      const key = `${x},${y}`;
      if (seen.has(key)) return false;
      seen.add(key);

      // bounds check
      if (typeof x !== "number" || typeof y !== "number") return false;
      if (x < 0 || x > 9 || y < 0 || y > 9) return false;

      // overlap check (cannot occupy same cell)
      for (const entry of this.ships) {
        for (const [sx, sy] of entry.coords) {
          if (sx === x && sy === y) return false;
        }
      }
    }

    // adjacency check: ensure no existing ship cell is adjacent (including diagonals)
    // build a set of occupied coords for quick lookup
    const occupied = new Set();
    for (const entry of this.ships) {
      for (const [sx, sy] of entry.coords) occupied.add(`${sx},${sy}`);
    }

    for (const [x, y] of coords) {
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || nx > 9 || ny < 0 || ny > 9) continue;
          if (occupied.has(`${nx},${ny}`)) return false;
        }
      }
    }

    return true;
  }

  receiveAttack(attack) {
    // attack: [x,y]
    for (const entry of this.ships) {
      const index = entry.coords.findIndex(
        ([x, y]) => x === attack[0] && y === attack[1]
      );
      if (index !== -1) {
        entry.ship.hit(index);
        const sunk = entry.ship.isSunk();
        return { hit: true, shipSunk: sunk };
      }
    }
    this.missedAttacks.push(attack);
    return { hit: false };
  }

  allShipsSunk() {
    return this.ships.every((entry) => entry.ship.isSunk());
  }
}
