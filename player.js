const Gameboard = require("./gameboard");

class Player {
  constructor(isComputer = false) {
    this.board = new Gameboard();
    this.isComputer = isComputer;
  }

  attack(enemyBoard, coords) {
    if (this.isComputer) {
      coords = this.generateRandomCoords();
    }
    return enemyBoard.receiveAttack(coords);
  }

  generateRandomCoords() {
    const x = Math.floor(Math.random() * 10);
    const y = Math.floor(Math.random() * 10);
    return [x, y];
  }
}

module.exports = Player; 