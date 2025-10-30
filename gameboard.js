const Ship = require("./ship");

class Gameboard {
  constructor() {
    this.ships = [];
    this.missedShots = [];
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
        entry.ship.hit();
        return true;
      }
    }
    this.missedShots.push(attack);
    return false;
  }

  allShipsSunk() {
    return this.ships.every((entry) => entry.ship.isSunk());
  }
}

module.exports = Gameboard;
