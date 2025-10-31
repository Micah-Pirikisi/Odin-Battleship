import Ship from "./ship.js"

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

  receiveAttack(attack) {
    for (const entry of this.ships) {
      const index = entry.coords.findIndex(
        ([x, y]) => x === attack[0] && y === attack[1]
      );
      if (index !== -1) {
        entry.ship.hit(index);
        return true;
      }
    }
    this.missedAttacks.push(attack);
    return false;
  }

  allShipsSunk() {
    return this.ships.every((entry) => entry.ship.isSunk());
  }
}
