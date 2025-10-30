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
