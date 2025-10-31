import startGame from "./gameController.js";
import { renderBoards, updateBoard } from "./domController.js";

const { human, computer } = startGame();

renderBoards(human.board, computer.board);

const computerBoardContainer = document.querySelector("#computer-board");

computerBoardContainer.addEventListener("click", (e) => {
  const target = e.target;
  if (!target.classList.contains("cell")) return;

  const x = Number(target.dataset.x);
  const y = Number(target.dataset.y);

  // ignore clicks on already attacked cells
  if (target.classList.contains("hit") || target.classList.contains("miss"))
    return;

  // human attacks computer
  human.attack(computer.board, [x, y]);

  // update the UI
  updateBoard("#computer-board", computer.board);

  // check if computer lost
  if (computer.board.allShipsSunk()) {
    alert("You win!");
    return;
  }

  // computer takes a turn
  const [cx, cy] = computer.generateRandomCoords();
  computer.attack(human.board, [cx, cy]);
  updateBoard("#player-board", human.board);

  if (human.board.allShipsSunk()) {
    alert("Computer wins!");
  }
});
