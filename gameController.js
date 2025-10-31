import Player from "./player.js";
import Gameboard from "./gameboard.js";
import { renderBoards, updateBoard } from "./domController.js";

export default function startGame() {
  const human = new Player(false);
  const computer = new Player(true);

  human.board.placeShip(3, [
    [0, 0],
    [0, 1],
    [0, 2],
  ]);
  human.board.placeShip(2, [
    [5, 5],
    [5, 6],
  ]);

  computer.board.placeShip(3, [
    [1, 1],
    [1, 2],
    [1, 3],
  ]);
  computer.board.placeShip(2, [
    [6, 6],
    [6, 7],
  ]);

  renderBoards(human.board, computer.board);

  return { human, computer };
}

export function randomizePlayerShips(player) {
  // clear board first
  player.board.ships = [];
  player.board.missedAttacks = [];

  const shipLengths = [5, 4, 3, 3, 2];

  for (const length of shipLengths) {
    let placed = false;
    while (!placed) {
      const orientation = Math.random() < 0.5 ? "horizontal" : "vertical";
      const x = Math.floor(Math.random() * 10);
      const y = Math.floor(Math.random() * 10);
      const coords = [];

      for (let i = 0; i < length; i++) {
        if (orientation === "horizontal") coords.push([x + i, y]);
        else coords.push([x, y + i]);
      }

      // ensure coords are valid (inside board and not overlapping)
      const isValid =
        coords.every(([cx, cy]) => cx < 10 && cy < 10) &&
        !player.board.ships.some((s) =>
          s.coords.some(([sx, sy]) =>
            coords.some(([cx, cy]) => cx === sx && cy === sy)
          )
        );

      if (isValid) {
        player.board.placeShip(length, coords);
        placed = true;
      }
    }
  }
}
